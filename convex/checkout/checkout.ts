import { v } from 'convex/values';
import { action, query } from '../_generated/server';
import { components, internal } from '../_generated/api';
import { Polar as PolarSDK } from '@polar-sh/sdk';
import { Doc, Id } from '../_generated/dataModel';
import {
  CartItemForCheckout,
  CheckoutSessionResponse,
  Address,
  Metadata,
} from './types';

/**
 * Helper function to create a bundle product for multi-product carts
 * HACK: Polar doesn't support multiple products in one checkout, so we create a temporary bundle
 */
async function createBundleProduct(
  polarClient: PolarSDK,
  polarProducts: CartItemForCheckout[],
  totalAmount: number,
): Promise<string> {
  const bundleName = `Bundle ${new Date().toISOString().split('T')[0]}-${Date.now()}`;

  // Create a concise description that fits in 500 chars
  const itemSummary = polarProducts
    .map((p) => `${p.name}${p.quantity > 1 ? ` (${p.quantity})` : ''}`)
    .join(' + ');

  const bundleDescription =
    itemSummary.length > 480
      ? `${polarProducts.length} items: ${itemSummary.substring(0, 470)}...`
      : `${polarProducts.length} items: ${itemSummary}`;

  try {
    const bundleProduct = await polarClient.products.create({
      name: bundleName,
      description: bundleDescription,
      prices: [
        {
          type: 'one_time',
          amountType: 'fixed',
          priceAmount: totalAmount,
          priceCurrency: 'usd',
        } as any, // Polar SDK type inference issue
      ],
      // Store bundle metadata for tracking
      metadata: {
        bundleType: 'checkout',
      },
    } as any);

    console.log(
      `[Bundle] Created ${bundleProduct.id} for ${polarProducts.length} items (${totalAmount / 100} USD)`,
    );
    return bundleProduct.id;
  } catch (error: any) {
    console.error('[Bundle] Failed to create:', error);
    throw new Error('Failed to create checkout bundle: ' + error.message);
  }
}

/**
 * Create a Polar checkout session for the current cart
 *
 * Implements ALL Polar Checkout API features:
 * - Customer identification & pre-fill
 * - Business customer support
 * - Billing address pre-fill
 * - Tax ID collection
 * - Discount codes
 * - Trial periods
 * - Subscription upgrades
 * - Custom field data
 * - IP address tracking for fraud prevention
 * - Separate customer metadata
 */
export const createCheckoutSession = action({
  args: {
    sessionId: v.optional(v.string()),
    successUrl: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),

    // IP address for fraud prevention and tax calculation
    customerIpAddress: v.optional(v.string()),

    // Advanced checkout options
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    allowDiscountCodes: v.optional(v.boolean()),
    requireBillingAddress: v.optional(v.boolean()),
    customFieldData: v.optional(v.record(v.string(), v.any())),

    // Trial configuration
    trialInterval: v.optional(v.string()),
    trialIntervalCount: v.optional(v.number()),

    // Subscription upgrade
    subscriptionId: v.optional(v.string()),

    // Customer overrides (for business customers, etc.)
    isBusinessCustomer: v.optional(v.boolean()),
    customerBillingName: v.optional(v.string()),
    customerTaxId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    console.log('[Checkout] userId:', userId);
    console.log('[Checkout] sessionId:', args.sessionId);

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    // Get the cart with items
    let cart: Doc<'carts'> | null = null;
    if (userId) {
      console.log('[Checkout] Looking up cart by userId');
      // @ts-ignore - Type instantiation is excessively deep (known Convex issue)
      cart = await ctx.runQuery(internal.cart.cart.internal_getCartByUserId, {
        userId,
      });
    } else if (args.sessionId) {
      console.log('[Checkout] Looking up cart by sessionId:', args.sessionId);
      // @ts-ignore - Type instantiation is excessively deep (known Convex issue)
      cart = await ctx.runQuery(
        internal.cart.cart.internal_getCartBySessionId,
        {
          sessionId: args.sessionId,
        },
      );
    }

    console.log('[Checkout] Cart found:', cart !== null);
    if (cart) {
      console.log('[Checkout] Cart ID:', cart._id);
    }

    if (!cart) {
      throw new Error(
        'Cart is empty. Please add items to your cart before checking out.',
      );
    }

    // Get cart items with product details
    const cartItemsRaw = await ctx.runQuery(
      internal.cart.cart.internal_getCartItems,
      {
        cartId: cart._id,
      },
    );

    // Filter out null items (TypeScript safety)
    const cartItems = cartItemsRaw.filter(
      (item: any): item is NonNullable<typeof item> => item !== null,
    );

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate all products have Polar product IDs and gather pricing info
    const polarProducts: CartItemForCheckout[] = [];

    for (const item of cartItems) {
      if (!item.product.polarProductId) {
        throw new Error(
          `Product "${item.product.name}" is not available for checkout`,
        );
      }

      // Get the Polar product details to find the price ID
      const polarProduct = await ctx.runQuery(components.polar.lib.getProduct, {
        id: item.product.polarProductId,
      });

      if (!polarProduct) {
        throw new Error(`Polar product not found for "${item.product.name}"`);
      }

      // Find the active price
      const activePrice = polarProduct.prices.find((p: any) => !p.isArchived);

      polarProducts.push({
        polarProductId: item.product.polarProductId,
        polarPriceId: activePrice?.id || null,
        quantity: item.quantity,
        name: item.product.name,
        price: item.price,
      });
    }

    // Get customer info for pre-filling checkout form
    // We don't create the customer here - Polar will handle it automatically
    let customerId: string | undefined;
    let customerEmail: string | undefined;
    let customerName: string | undefined;
    let customerBillingAddress: Address | undefined;
    let customerTaxId: string | undefined;

    // Use provided IP address
    const customerIpAddress = args.customerIpAddress;

    if (userId) {
      // Check if customer exists in Convex (synced from Polar via webhook)
      const existingCustomer = await ctx.runQuery(
        components.polar.lib.getCustomerByUserId,
        { userId },
      );

      if (existingCustomer) {
        // Use existing customer data to pre-fill checkout
        customerId = existingCustomer.id;
        customerEmail = existingCustomer.email || undefined;
        customerName = existingCustomer.name || undefined;

        // Pre-fill billing address if available
        if (existingCustomer.billing_address) {
          customerBillingAddress = {
            line1: existingCustomer.billing_address.line1 || undefined,
            line2: existingCustomer.billing_address.line2 || undefined,
            postal_code:
              existingCustomer.billing_address.postal_code || undefined,
            city: existingCustomer.billing_address.city || undefined,
            state: existingCustomer.billing_address.state || undefined,
            country: existingCustomer.billing_address.country,
          };
        }

        // Pre-fill tax ID if available
        if (existingCustomer.tax_id) {
          customerTaxId =
            Array.isArray(existingCustomer.tax_id) &&
            existingCustomer.tax_id.length > 0
              ? existingCustomer.tax_id[0]
              : undefined;
        }
      }

      // If no customer found in Convex, get user info from auth
      // Polar will create the customer during checkout, then webhook will sync it
      if (!customerEmail) {
        const user = await ctx.runQuery(
          internal.cart.cart.internal_getAuthUser,
          {
            userId,
          },
        );
        if (user) {
          customerEmail = user.email;
          customerName = user.name || undefined;
        }
      }
    }

    // Initialize Polar SDK
    const polarClient = new PolarSDK({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      // Build the checkout metadata with cart items
      // Polar supports up to 50 key-value pairs, so store items individually
      const checkoutMetadata: Metadata = {
        cartId: cart._id,
        itemCount: polarProducts.length,
      };

      // Add each item to metadata (Polar supports up to 50 key-value pairs)
      polarProducts.forEach((item, index) => {
        checkoutMetadata[`item_${index}_id`] = item.polarProductId;
        checkoutMetadata[`item_${index}_name`] = item.name;
        checkoutMetadata[`item_${index}_quantity`] = item.quantity;
        checkoutMetadata[`item_${index}_price`] = item.price;
      });

      // Only add userId/sessionId if they have values
      if (userId) {
        checkoutMetadata.userId = userId;
      }
      if (args.sessionId) {
        checkoutMetadata.sessionId = args.sessionId;
      }

      // Add user-provided metadata
      if (args.metadata) {
        Object.assign(checkoutMetadata, args.metadata);
      }

      // Build customer metadata (separate from checkout metadata)
      const customerMetadata: Metadata = {
        source: 'storefront',
        cartId: cart._id,
      };

      // Calculate total amount
      const totalAmount = polarProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      );

      // Prepare checkout data with ALL Polar API features
      const firstProduct = polarProducts[0];
      if (!firstProduct) {
        throw new Error('No products in cart');
      }

      // HACK: Create bundle product for multi-product carts
      // Polar doesn't support multiple products in one checkout
      let checkoutProductId: string;
      let isBundleCheckout = false;

      if (polarProducts.length > 1) {
        // Multiple products - create a bundle
        checkoutProductId = await createBundleProduct(
          polarClient,
          polarProducts,
          totalAmount,
        );
        isBundleCheckout = true;
        // Store bundle ID in metadata for cleanup later
        checkoutMetadata.bundleProductId = checkoutProductId;
      } else {
        // Single product - use it directly
        checkoutProductId = firstProduct.polarProductId;
      }

      const checkoutData: any = {
        // Required fields - Polar only supports one product in checkout
        // For multi-item carts, we create a bundle product
        products: [checkoutProductId],
        success_url: args.successUrl,

        // Metadata
        metadata: checkoutMetadata,
        customer_metadata: customerMetadata,

        // Customer identification
        ...(customerId && { customer_id: customerId }),
        ...(customerEmail && { customer_email: customerEmail }),
        ...(customerName && { customer_name: customerName }),
        ...(userId && { external_customer_id: userId }),

        // Business customer support
        ...(args.isBusinessCustomer !== undefined && {
          is_business_customer: args.isBusinessCustomer,
        }),

        // Billing information
        ...(args.customerBillingName && {
          customer_billing_name: args.customerBillingName,
        }),
        ...(customerBillingAddress && {
          customer_billing_address: customerBillingAddress,
        }),
        ...((args.customerTaxId || customerTaxId) && {
          customer_tax_id: args.customerTaxId || customerTaxId,
        }),

        // Require billing address flag
        ...(args.requireBillingAddress !== undefined && {
          require_billing_address: args.requireBillingAddress,
        }),

        // Discount support
        ...(args.discountId && { discount_id: args.discountId }),
        ...(args.allowDiscountCodes !== undefined && {
          allow_discount_codes: args.allowDiscountCodes,
        }),

        // Custom field data
        ...(args.customFieldData && {
          custom_field_data: args.customFieldData,
        }),

        // Trial period configuration
        ...(args.trialInterval && { trial_interval: args.trialInterval }),
        ...(args.trialIntervalCount && {
          trial_interval_count: args.trialIntervalCount,
        }),

        // Subscription upgrade
        ...(args.subscriptionId && { subscription_id: args.subscriptionId }),

        // IP address for fraud prevention and tax calculation
        ...(customerIpAddress && { customer_ip_address: customerIpAddress }),
      };

      // For bundle checkouts, the amount is already set in the bundle product
      // For single products with quantity > 1, set custom amount
      if (!isBundleCheckout && firstProduct.quantity > 1) {
        checkoutData.amount = totalAmount;
      }

      console.log('[Checkout] Creating Polar checkout with data:');
      console.log('  - Customer IP:', args.customerIpAddress || 'not provided');
      console.log('  - Customer Email:', customerEmail || 'not provided');
      console.log(
        '  - Billing Address:',
        customerBillingAddress ? 'provided' : 'not provided',
      );
      console.log('  - Product ID:', checkoutProductId);
      console.log('  - Is Bundle:', isBundleCheckout);
      console.log('  - Amount:', totalAmount / 100, 'USD');
      console.log('  - Environment:', process.env.POLAR_SERVER);

      const checkout = await polarClient.checkouts.create(checkoutData);

      if (!checkout || !checkout.url) {
        throw new Error('Failed to create checkout session');
      }

      console.log('[Checkout] Polar checkout created:');
      console.log('  - Checkout ID:', checkout.id);
      console.log('  - Subtotal (amount):', checkout.amount / 100, 'USD');
      console.log(
        '  - Tax (tax_amount):',
        checkout.taxAmount ? checkout.taxAmount / 100 : 'null',
      );
      console.log(
        '  - Total (total_amount):',
        checkout.totalAmount / 100,
        'USD',
      );

      // Store checkout session ID and discount info in the cart
      await ctx.runMutation(internal.cart.cart.internal_updateCartCheckout, {
        cartId: cart._id,
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
        discountId: args.discountId,
        discountCode: args.discountCode,
        customFieldData: args.customFieldData,
      });

      const response: CheckoutSessionResponse = {
        success: true,
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
        clientSecret: checkout.clientSecret,
        amount: checkout.totalAmount,
        currency: checkout.currency,
        status: checkout.status,
        expiresAt: checkout.expiresAt.toString(),
      };

      return response;
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  },
});

/**
 * Create checkout session with IP address tracking
 * This action accepts the customer IP address from request headers
 * Note: This is now the same as createCheckoutSession since IP tracking is built-in
 */
export const createCheckoutSessionWithIP = action({
  args: {
    sessionId: v.optional(v.string()),
    successUrl: v.string(),
    embedOrigin: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    customerIpAddress: v.string(), // Required for fraud prevention

    // Advanced checkout options
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    allowDiscountCodes: v.optional(v.boolean()),
    requireBillingAddress: v.optional(v.boolean()),
    customFieldData: v.optional(v.record(v.string(), v.any())),

    // Trial configuration
    trialInterval: v.optional(v.string()),
    trialIntervalCount: v.optional(v.number()),

    // Subscription upgrade
    subscriptionId: v.optional(v.string()),

    // Customer overrides
    isBusinessCustomer: v.optional(v.boolean()),
    customerBillingName: v.optional(v.string()),
    customerTaxId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CheckoutSessionResponse> => {
    // This is just an alias for createCheckoutSession with explicit IP tracking
    // Both now support the same features
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    // Get the cart with items
    let cart: Doc<'carts'> | null = null;
    if (userId) {
      // @ts-ignore - Type instantiation is excessively deep (known Convex issue)
      cart = await ctx.runQuery(internal.cart.cart.internal_getCartByUserId, {
        userId,
      });
    } else if (args.sessionId) {
      // @ts-ignore - Type instantiation is excessively deep (known Convex issue)
      cart = await ctx.runQuery(
        internal.cart.cart.internal_getCartBySessionId,
        {
          sessionId: args.sessionId,
        },
      );
    }

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Get cart items with product details
    const cartItemsRaw = await ctx.runQuery(
      internal.cart.cart.internal_getCartItems,
      {
        cartId: cart._id,
      },
    );

    // Filter out null items (TypeScript safety)
    const cartItems = cartItemsRaw.filter(
      (item: any): item is NonNullable<typeof item> => item !== null,
    );

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate all products have Polar product IDs and gather pricing info
    const polarProducts: CartItemForCheckout[] = [];

    for (const item of cartItems) {
      if (!item.product.polarProductId) {
        throw new Error(
          `Product "${item.product.name}" is not available for checkout`,
        );
      }

      // Get the Polar product details to find the price ID
      const polarProduct = await ctx.runQuery(components.polar.lib.getProduct, {
        id: item.product.polarProductId,
      });

      if (!polarProduct) {
        throw new Error(`Polar product not found for "${item.product.name}"`);
      }

      // Find the active price
      const activePrice = polarProduct.prices.find((p: any) => !p.isArchived);

      polarProducts.push({
        polarProductId: item.product.polarProductId,
        polarPriceId: activePrice?.id || null,
        quantity: item.quantity,
        name: item.product.name,
        price: item.price,
      });
    }

    // Get customer info for pre-filling checkout form
    // We don't create the customer here - Polar will handle it automatically
    let customerId: string | undefined;
    let customerEmail: string | undefined;
    let customerName: string | undefined;
    let customerBillingAddress: Address | undefined;
    let customerTaxId: string | undefined;

    // Use provided IP address
    const customerIpAddress = args.customerIpAddress;

    if (userId) {
      // Check if customer exists in Convex (synced from Polar via webhook)
      const existingCustomer = await ctx.runQuery(
        components.polar.lib.getCustomerByUserId,
        { userId },
      );

      if (existingCustomer) {
        // Use existing customer data to pre-fill checkout
        customerId = existingCustomer.id;
        customerEmail = existingCustomer.email || undefined;
        customerName = existingCustomer.name || undefined;

        // Pre-fill billing address if available
        if (existingCustomer.billing_address) {
          customerBillingAddress = {
            line1: existingCustomer.billing_address.line1 || undefined,
            line2: existingCustomer.billing_address.line2 || undefined,
            postal_code:
              existingCustomer.billing_address.postal_code || undefined,
            city: existingCustomer.billing_address.city || undefined,
            state: existingCustomer.billing_address.state || undefined,
            country: existingCustomer.billing_address.country,
          };
        }

        // Pre-fill tax ID if available
        if (existingCustomer.tax_id) {
          customerTaxId =
            Array.isArray(existingCustomer.tax_id) &&
            existingCustomer.tax_id.length > 0
              ? existingCustomer.tax_id[0]
              : undefined;
        }
      }

      // If no customer found in Convex, get user info from auth
      // Polar will create the customer during checkout, then webhook will sync it
      if (!customerEmail) {
        const user = await ctx.runQuery(
          internal.cart.cart.internal_getAuthUser,
          {
            userId,
          },
        );
        if (user) {
          customerEmail = user.email;
          customerName = user.name || undefined;
        }
      }
    }

    // Initialize Polar SDK
    const polarClient = new PolarSDK({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      // Build the checkout metadata with cart items
      // Polar supports up to 50 key-value pairs, so store items individually
      const checkoutMetadata: Metadata = {
        cartId: cart._id,
        itemCount: polarProducts.length,
      };

      // Add each item to metadata (Polar supports up to 50 key-value pairs)
      polarProducts.forEach((item, index) => {
        checkoutMetadata[`item_${index}_id`] = item.polarProductId;
        checkoutMetadata[`item_${index}_name`] = item.name;
        checkoutMetadata[`item_${index}_quantity`] = item.quantity;
        checkoutMetadata[`item_${index}_price`] = item.price;
      });

      // Only add userId/sessionId if they have values
      if (userId) {
        checkoutMetadata.userId = userId;
      }
      if (args.sessionId) {
        checkoutMetadata.sessionId = args.sessionId;
      }

      // Add user-provided metadata
      if (args.metadata) {
        Object.assign(checkoutMetadata, args.metadata);
      }

      // Build customer metadata (separate from checkout metadata)
      const customerMetadata: Metadata = {
        source: 'storefront',
        cartId: cart._id,
      };

      // Calculate total amount
      const totalAmount = polarProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      );

      // Prepare checkout data with ALL Polar API features
      const firstProduct = polarProducts[0];
      if (!firstProduct) {
        throw new Error('No products in cart');
      }

      // HACK: Create bundle product for multi-product carts
      // Polar doesn't support multiple products in one checkout
      let checkoutProductId: string;
      let isBundleCheckout = false;

      if (polarProducts.length > 1) {
        // Multiple products - create a bundle
        checkoutProductId = await createBundleProduct(
          polarClient,
          polarProducts,
          totalAmount,
        );
        isBundleCheckout = true;
        // Store bundle ID in metadata for cleanup later
        checkoutMetadata.bundleProductId = checkoutProductId;
      } else {
        // Single product - use it directly
        checkoutProductId = firstProduct.polarProductId;
      }

      const checkoutData: any = {
        // Required fields - Polar only supports one product in checkout
        // For multi-item carts, we create a bundle product
        products: [checkoutProductId],
        success_url: args.successUrl,

        // Metadata
        metadata: checkoutMetadata,
        customer_metadata: customerMetadata,

        // Customer identification
        ...(customerId && { customer_id: customerId }),
        ...(customerEmail && { customer_email: customerEmail }),
        ...(customerName && { customer_name: customerName }),
        ...(userId && { external_customer_id: userId }),

        // Business customer support
        ...(args.isBusinessCustomer !== undefined && {
          is_business_customer: args.isBusinessCustomer,
        }),

        // Billing information
        ...(args.customerBillingName && {
          customer_billing_name: args.customerBillingName,
        }),
        ...(customerBillingAddress && {
          customer_billing_address: customerBillingAddress,
        }),
        ...((args.customerTaxId || customerTaxId) && {
          customer_tax_id: args.customerTaxId || customerTaxId,
        }),

        // Require billing address flag
        ...(args.requireBillingAddress !== undefined && {
          require_billing_address: args.requireBillingAddress,
        }),

        // Discount support
        ...(args.discountId && { discount_id: args.discountId }),
        ...(args.allowDiscountCodes !== undefined && {
          allow_discount_codes: args.allowDiscountCodes,
        }),

        // Custom field data
        ...(args.customFieldData && {
          custom_field_data: args.customFieldData,
        }),

        // Trial period configuration
        ...(args.trialInterval && { trial_interval: args.trialInterval }),
        ...(args.trialIntervalCount && {
          trial_interval_count: args.trialIntervalCount,
        }),

        // Subscription upgrade
        ...(args.subscriptionId && { subscription_id: args.subscriptionId }),

        // IP address for fraud prevention and tax calculation
        ...(customerIpAddress && { customer_ip_address: customerIpAddress }),
      };

      // For bundle checkouts, the amount is already set in the bundle product
      // For single products with quantity > 1, set custom amount
      if (!isBundleCheckout && firstProduct.quantity > 1) {
        checkoutData.amount = totalAmount;
      }

      console.log('[Checkout] Creating Polar checkout with data:');
      console.log('  - Customer IP:', args.customerIpAddress || 'not provided');
      console.log('  - Customer Email:', customerEmail || 'not provided');
      console.log(
        '  - Billing Address:',
        customerBillingAddress ? 'provided' : 'not provided',
      );
      console.log('  - Product ID:', checkoutProductId);
      console.log('  - Is Bundle:', isBundleCheckout);
      console.log('  - Amount:', totalAmount / 100, 'USD');
      console.log('  - Environment:', process.env.POLAR_SERVER);

      const checkout = await polarClient.checkouts.create(checkoutData);

      if (!checkout || !checkout.url) {
        throw new Error('Failed to create checkout session');
      }

      console.log('[Checkout] Polar checkout created:');
      console.log('  - Checkout ID:', checkout.id);
      console.log('  - Subtotal (amount):', checkout.amount / 100, 'USD');
      console.log(
        '  - Tax (tax_amount):',
        checkout.taxAmount ? checkout.taxAmount / 100 : 'null',
      );
      console.log(
        '  - Total (total_amount):',
        checkout.totalAmount / 100,
        'USD',
      );

      // Store checkout session ID and discount info in the cart
      await ctx.runMutation(internal.cart.cart.internal_updateCartCheckout, {
        cartId: cart._id,
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
        discountId: args.discountId,
        discountCode: args.discountCode,
        customFieldData: args.customFieldData,
      });

      const response: CheckoutSessionResponse = {
        success: true,
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
        clientSecret: checkout.clientSecret,
        amount: checkout.totalAmount,
        currency: checkout.currency,
        status: checkout.status,
        expiresAt: checkout.expiresAt.toString(),
      };

      return response;
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  },
});

/**
 * Handle successful checkout completion
 * Enhanced to capture all new checkout fields
 */
export const handleCheckoutSuccess = action({
  args: {
    checkoutId: v.string(),
  },
  handler: async (ctx, { checkoutId }) => {
    const polarClient = new PolarSDK({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      // Get checkout details from Polar
      const checkout = await polarClient.checkouts.get({ id: checkoutId });

      if (!checkout) {
        throw new Error('Checkout not found');
      }

      const metadata = checkout.metadata || {};
      const cartId = metadata.cartId as Id<'carts'>;
      const userId = (metadata.userId as string) || undefined;

      // Extract customer info from checkout
      const customerEmail = checkout.customerEmail || undefined;
      const customerName = checkout.customerName || undefined;
      const customerIpAddress = checkout.customerIpAddress || undefined;
      const isBusinessCustomer = checkout.isBusinessCustomer || false;
      const customerTaxId = checkout.customerTaxId || undefined;

      // Extract billing address
      const billingAddress = checkout.customerBillingAddress
        ? {
            line1: checkout.customerBillingAddress.line1 || undefined,
            line2: checkout.customerBillingAddress.line2 || undefined,
            postal_code:
              checkout.customerBillingAddress.postalCode || undefined,
            city: checkout.customerBillingAddress.city || undefined,
            state: checkout.customerBillingAddress.state || undefined,
            country: checkout.customerBillingAddress.country,
          }
        : undefined;

      // Parse cart items from metadata
      let cartItems: Array<{
        productId: string;
        priceId: string | null;
        quantity: number;
        name: string;
        price: number;
      }> = [];

      if (metadata.cartItems) {
        try {
          cartItems = JSON.parse(metadata.cartItems as string);
        } catch (e) {
          console.error('Failed to parse cart items from metadata:', e);
        }
      }

      // Extract discount info
      const discountId = checkout.discountId || undefined;

      // Extract trial info
      const trialInterval = checkout.activeTrialInterval || undefined;
      const trialIntervalCount = checkout.activeTrialIntervalCount || undefined;
      const trialEnd = checkout.trialEnd
        ? new Date(checkout.trialEnd).getTime()
        : undefined;

      // Create order record with ALL new fields
      await ctx.runMutation(internal.cart.cart.internal_createOrder, {
        checkoutId,
        userId,
        email: customerEmail,
        customerId: checkout.customerId || undefined,
        status: checkout.status,

        // Amounts
        amount: checkout.amount,
        discountAmount: checkout.discountAmount,
        taxAmount: checkout.taxAmount || undefined,
        totalAmount: checkout.totalAmount,
        currency: checkout.currency,

        // Products
        products: cartItems.map((item) => ({
          id: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),

        // Customer details
        customerName,
        customerIpAddress,
        isBusinessCustomer,
        customerTaxId,
        billingAddress,

        // Discount
        discountId,
        discountCode: undefined, // We don't get the code back from Polar

        // Trial info
        trialInterval,
        trialIntervalCount,
        trialEnd,

        // Subscription
        subscriptionId: checkout.subscriptionId || undefined,

        // Metadata
        metadata: metadata as Record<string, any>,
        customFieldData: checkout.customFieldData
          ? (checkout.customFieldData as Record<string, any>)
          : undefined,
      });

      // Clear the cart only if checkout succeeded
      if (checkout.status === 'succeeded' && cartId) {
        // Decrement inventory for each purchased item
        const itemCount = metadata.itemCount as number;
        console.log(`[Checkout] Decrementing inventory for ${itemCount} items`);

        for (let i = 0; i < itemCount; i++) {
          const productId = metadata[`item_${i}_id`] as string;
          const quantity = metadata[`item_${i}_quantity`] as number;

          if (productId && quantity) {
            try {
              await ctx.runMutation(
                internal.products.products.decrementInventoryInternal,
                {
                  productId: productId as any,
                  quantity,
                },
              );
              console.log(
                `  ✓ Decremented inventory for ${metadata[`item_${i}_name`]} by ${quantity}`,
              );
            } catch (error) {
              console.error(
                `  ✗ Failed to decrement inventory for ${productId}:`,
                error,
              );
            }
          }
        }

        await ctx.runMutation(internal.cart.cart.internal_clearCartItems, {
          cartId,
        });

        // Clean up bundle product if one was created
        const bundleProductId = metadata.bundleProductId as string | undefined;
        if (bundleProductId) {
          try {
            await polarClient.products.update({
              id: bundleProductId,
              productUpdate: {
                isArchived: true,
              },
            });
            console.log(
              `[Bundle] Archived ${bundleProductId} after successful checkout`,
            );
          } catch (error) {
            // Don't fail the checkout if cleanup fails
            console.error(
              `[Bundle] Failed to archive ${bundleProductId}:`,
              error,
            );
          }
        }
      }

      return {
        success: true,
        status: checkout.status,
        orderId: checkoutId,
      };
    } catch (error: any) {
      console.error('Failed to handle checkout success:', error);
      throw new Error(error.message || 'Failed to process checkout');
    }
  },
});

// ============================================
// INTERNAL HELPER FUNCTIONS
// ============================================
// All helper functions moved to cart.ts as internal queries/mutations:
// - internal_getCartByUserId
// - internal_getCartBySessionId
// - internal_getCartItems
// - internal_getAuthUser
// - internal_updateCartCheckout
// - internal_clearCartItems
// - internal_createOrder
//
// Note: Customer creation is now handled automatically by Polar during checkout
// The webhook syncs customers back to Convex
// Use api.polarCustomer.ensurePolarCustomer if you need to create a customer upfront

// ============================================
// EXPORTED ACTIONS
// ============================================

/**
 * Get checkout session by ID
 */
export const getCheckout = action({
  args: {
    checkoutId: v.string(),
  },
  handler: async (_ctx, { checkoutId }) => {
    const polarClient = new PolarSDK({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      const checkout = await polarClient.checkouts.get({ id: checkoutId });
      return checkout;
    } catch (error: any) {
      console.error('Failed to get checkout:', error);
      return null;
    }
  },
});

/**
 * Get user's order history (includes guest orders by email)
 */
export const getUserOrders = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = args.userId || identity?.subject;

    if (!userId) {
      return [];
    }

    // Get user's email from Better Auth
    const user = await ctx.db
      .query('betterAuth_user' as any)
      .filter((q: any) => q.eq(q.field('id'), userId))
      .first();

    const orders = [];

    // Get orders linked to userId
    const userOrders = await ctx.db
      .query('orders')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
    orders.push(...userOrders);

    // Also get any guest orders with the same email that haven't been linked yet
    if (user?.email) {
      const guestOrders = await ctx.db
        .query('orders')
        .withIndex('email', (q: any) => q.eq('email', user.email))
        .filter((q: any) => q.eq(q.field('userId'), undefined))
        .order('desc')
        .collect();
      orders.push(...guestOrders);
    }

    // Sort all orders by creation date
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a specific order
 */
export const getOrder = query({
  args: {
    checkoutId: v.string(),
  },
  handler: async (ctx, { checkoutId }) => {
    return await ctx.db
      .query('orders')
      .withIndex('checkoutId', (q) => q.eq('checkoutId', checkoutId))
      .first();
  },
});
