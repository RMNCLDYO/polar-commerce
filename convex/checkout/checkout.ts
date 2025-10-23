import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { components, internal } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import { action, query, type ActionCtx } from '../_generated/server';
import * as CheckoutModel from '../model/checkout';
import type {
  Address,
  CartItemForCheckout,
  CheckoutSessionResponse,
  Metadata,
} from './types';
import {
  vCheckoutSessionResponse,
  vCheckoutSuccessResponse,
} from './types';

async function createBundleProduct(
  polarClient: PolarSDK,
  polarProducts: CartItemForCheckout[],
  totalAmount: number,
): Promise<string> {
  const bundleName = `Bundle ${new Date().toISOString().split('T')[0]}-${Date.now()}`;

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
          amountType: 'fixed',
          priceAmount: totalAmount,
          priceCurrency: 'usd',
        },
      ],
      metadata: {
        bundleType: 'checkout',
      },
    });

    return bundleProduct.id;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create checkout bundle: ${errorMessage}`);
  }
}

export async function createCheckoutSessionHelper(
  ctx: ActionCtx,
  args: {
    sessionId?: string;
    successUrl: string;
    metadata?: Record<string, unknown>;
    customerIpAddress?: string;
    customerEmail?: string;
    discountId?: string;
    discountCode?: string;
    allowDiscountCodes?: boolean;
    requireBillingAddress?: boolean;
    customFieldData?: Record<string, unknown> | {
      organizationName?: string;
      taxExemptId?: string;
      purchaseOrderNumber?: string;
      department?: string;
      costCenter?: string;
      projectCode?: string;
      additionalNotes?: string;
      orderNotes?: string;
    };
    trialInterval?: 'day' | 'week' | 'month' | 'year';
    trialIntervalCount?: number;
    subscriptionId?: string;
    isBusinessCustomer?: boolean;
    customerBillingName?: string;
    customerTaxId?: string;
  },
): Promise<CheckoutSessionResponse> {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;

  if (!userId && !args.sessionId) {
    throw new Error('User must be authenticated or provide a session ID');
  }

  await ctx.runMutation(internal.lib.rateLimit.checkAndUpdate, {
    limitType: 'checkout',
    userId: userId || undefined,
    sessionId: args.sessionId || undefined,
  });

  let cart: Doc<'carts'> | null = null;
  if (userId) {
    cart = (await ctx.runQuery(internal.cart.cart.internal_getCartByUserId, {
      userId,
    })) as Doc<'carts'> | null;
  } else if (args.sessionId) {
    cart = await ctx.runQuery(
      internal.cart.cart.internal_getCartBySessionId,
      {
        sessionId: args.sessionId,
      },
    );
  }

  if (!cart) {
    throw new Error(
      'Cart is empty. Please add items to your cart before checking out.',
    );
  }

  const cartItemsRaw = await ctx.runQuery(
    internal.cart.cart.internal_getCartItems,
    {
      cartId: cart._id,
    },
  );

  const cartItems = cartItemsRaw.filter(
    (
      item: (typeof cartItemsRaw)[number],
    ): item is NonNullable<(typeof cartItemsRaw)[number]> => item !== null,
  );

  if (cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const polarProducts = await CheckoutModel.batchFetchPolarProducts(
    ctx,
    cartItems,
  );

  let customerId: string | undefined;
  let customerEmail: string | undefined;
  let customerName: string | undefined;
  let customerBillingAddress: Address | undefined;
  let customerTaxId: string | undefined;

  const customerIpAddress = args.customerIpAddress;

  if (userId) {
    const existingCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      { userId },
    );

    if (existingCustomer) {
      customerId = existingCustomer.id;
      customerEmail = existingCustomer.email || undefined;
      customerName = existingCustomer.name || undefined;

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

      if (existingCustomer.tax_id) {
        customerTaxId =
          Array.isArray(existingCustomer.tax_id) &&
            existingCustomer.tax_id.length > 0
            ? existingCustomer.tax_id[0]
            : undefined;
      }
    }

    if (!customerEmail) {
      const user = await ctx.runQuery(
        internal.cart.cart.internal_getAuthUser,
        {
          userId,
        },
      ) as { email: string; name?: string } | null;
      if (user) {
        customerEmail = user.email;
        customerName = user.name || undefined;
      }
    }
  }

  const token = process.env.POLAR_ORGANIZATION_TOKEN;
  if (!token) {
    throw new Error('POLAR_ORGANIZATION_TOKEN not set');
  }

  const polarClient = new PolarSDK({
    accessToken: token,
    server:
      (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
  });

  try {
    const checkoutMetadata: Metadata = {
      cartId: cart._id,
      itemCount: polarProducts.length,
    };

    polarProducts.forEach((item, index) => {
      checkoutMetadata[`item_${index}_id`] = item.polarProductId;
      checkoutMetadata[`item_${index}_name`] = item.name;
      checkoutMetadata[`item_${index}_quantity`] = item.quantity;
      checkoutMetadata[`item_${index}_price`] = item.price;
    });

    if (userId) {
      checkoutMetadata.userId = userId;
    }
    if (args.sessionId) {
      checkoutMetadata.sessionId = args.sessionId;
    }

    if (args.metadata) {
      Object.assign(checkoutMetadata, args.metadata);
    }

    const customerMetadata: Metadata = {
      source: 'storefront',
      cartId: cart._id,
    };

    const totalAmount = polarProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );

    const firstProduct = polarProducts[0];
    if (!firstProduct) {
      throw new Error('No products in cart');
    }

    let checkoutProductId: string;

    const hasMultipleProducts = polarProducts.length > 1;
    const hasMultipleQuantity = polarProducts.some((p) => p.quantity > 1);
    const shouldCreateBundle = hasMultipleProducts || hasMultipleQuantity;

    if (shouldCreateBundle) {
      checkoutProductId = await createBundleProduct(
        polarClient,
        polarProducts,
        totalAmount,
      );
      checkoutMetadata.bundleProductId = checkoutProductId;
    } else {
      checkoutProductId = firstProduct.polarProductId;
    }

    const checkoutData = {
      products: [checkoutProductId],
      success_url: args.successUrl,

      metadata: checkoutMetadata,
      customer_metadata: customerMetadata,

      ...(customerId && { customer_id: customerId }),
      ...(customerEmail && { customer_email: customerEmail }),
      ...(customerName && { customer_name: customerName }),
      ...(userId && { external_customer_id: userId }),

      ...(args.isBusinessCustomer !== undefined && {
        is_business_customer: args.isBusinessCustomer,
      }),

      ...(args.customerBillingName && {
        customer_billing_name: args.customerBillingName,
      }),
      ...(customerBillingAddress && {
        customer_billing_address: customerBillingAddress,
      }),
      ...((args.customerTaxId || customerTaxId) && {
        customer_tax_id: args.customerTaxId || customerTaxId,
      }),

      ...(args.requireBillingAddress !== undefined && {
        require_billing_address: args.requireBillingAddress,
      }),

      ...(args.discountId && { discount_id: args.discountId }),
      ...(args.allowDiscountCodes !== undefined && {
        allow_discount_codes: args.allowDiscountCodes,
      }),

      ...(args.customFieldData && {
        custom_field_data: args.customFieldData,
      }),

      ...(args.trialInterval && { trial_interval: args.trialInterval }),
      ...(args.trialIntervalCount && {
        trial_interval_count: args.trialIntervalCount,
      }),

      ...(args.subscriptionId && { subscription_id: args.subscriptionId }),

      ...(customerIpAddress && { customer_ip_address: customerIpAddress }),
    };

    const checkout = await polarClient.checkouts.create(checkoutData);

    if (!checkout || !checkout.url) {
      throw new Error('Failed to create checkout session');
    }

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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to create checkout session';
    throw new Error(errorMessage);
  }
}

export const createCheckoutSession = action({
  args: {
    sessionId: v.optional(v.string()),
    successUrl: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),

    customerIpAddress: v.optional(v.string()),
    customerEmail: v.optional(v.string()),

    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    allowDiscountCodes: v.optional(v.boolean()),
    requireBillingAddress: v.optional(v.boolean()),
    customFieldData: v.optional(v.record(v.string(), v.any())),

    trialInterval: v.optional(
      v.union(
        v.literal('day'),
        v.literal('week'),
        v.literal('month'),
        v.literal('year'),
      ),
    ),
    trialIntervalCount: v.optional(v.number()),

    subscriptionId: v.optional(v.string()),

    isBusinessCustomer: v.optional(v.boolean()),
    customerBillingName: v.optional(v.string()),
    customerTaxId: v.optional(v.string()),
  },
  returns: vCheckoutSessionResponse,
  handler: async (ctx, args): Promise<CheckoutSessionResponse> => {
    return await createCheckoutSessionHelper(ctx, args);
  },
});

export const handleCheckoutSuccess = action({
  args: {
    checkoutId: v.string(),
  },
  returns: vCheckoutSuccessResponse,
  handler: async (ctx, { checkoutId }): Promise<{ success: boolean; status: string; orderId: string }> => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      throw new Error('POLAR_ORGANIZATION_TOKEN not set');
    }
    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      const checkout = await polarClient.checkouts.get({ id: checkoutId });

      if (!checkout) {
        throw new Error('Checkout not found');
      }

      const metadata = checkout.metadata || {};
      const cartId = metadata.cartId as Id<'carts'>;
      const userId = (metadata.userId as string) || undefined;

      const customerEmail = checkout.customerEmail || undefined;
      const customerName = checkout.customerName || undefined;
      const customerIpAddress = checkout.customerIpAddress || undefined;
      const isBusinessCustomer = checkout.isBusinessCustomer || false;
      const customerTaxId = checkout.customerTaxId || undefined;

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

      let cartItems: Array<{
        catalogId?: Id<'catalog'>;
        productId?: string;
        priceId?: string | null;
        quantity: number;
        name: string;
        price: number;
      }> = [];

      if (metadata.cartItems) {
        try {
          cartItems = JSON.parse(metadata.cartItems as string) as Array<{
            catalogId: Id<'catalog'>;
            quantity: number;
            name: string;
            price: number;
          }>;
        } catch {
        }
      }

      const discountId = checkout.discountId || undefined;

      const trialInterval = checkout.activeTrialInterval || undefined;
      const trialIntervalCount = checkout.activeTrialIntervalCount || undefined;
      const trialEnd = checkout.trialEnd
        ? new Date(checkout.trialEnd).getTime()
        : undefined;

      await ctx.runMutation(internal.cart.cart.internal_createOrder, {
        checkoutId,
        userId,
        email: customerEmail,
        customerId: checkout.customerId || undefined,
        status: checkout.status,

        amount: checkout.amount,
        discountAmount: checkout.discountAmount,
        taxAmount: checkout.taxAmount || undefined,
        totalAmount: checkout.totalAmount,
        currency: checkout.currency,

        products: cartItems.map((item) => ({
          id: item.productId || item.catalogId || '',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),

        customerName,
        customerIpAddress,
        isBusinessCustomer,
        customerTaxId,
        billingAddress,

        discountId,
        discountCode: undefined,

        trialInterval,
        trialIntervalCount,
        trialEnd,

        subscriptionId: checkout.subscriptionId || undefined,

        metadata: metadata as Record<string, string | number | boolean>,
        customFieldData: checkout.customFieldData
          ? (checkout.customFieldData as Record<
            string,
            string | number | boolean
          >)
          : undefined,
      });

      if (checkout.status === 'succeeded' && cartId) {
        const itemCount = metadata.itemCount as number;

        const inventoryUpdates: Array<{
          productId: Id<'catalog'>;
          quantity: number;
          name: string;
        }> = [];

        for (let i = 0; i < itemCount; i++) {
          const productId = metadata[`item_${i}_id`] as string;
          const quantity = metadata[`item_${i}_quantity`] as number;
          const name = metadata[`item_${i}_name`] as string;

          if (productId && quantity) {
            inventoryUpdates.push({
              productId: productId as Id<'catalog'>,
              quantity,
              name,
            });
          }
        }

        if (inventoryUpdates.length > 0) {
          await ctx.runMutation(
            internal.catalog.catalog.batchDecrementInventory,
            {
              updates: inventoryUpdates,
            },
          );
        }

        await ctx.runMutation(internal.cart.cart.internal_clearCartItems, {
          cartId,
        });

        const bundleProductId = metadata.bundleProductId as string | undefined;
        if (bundleProductId) {
          try {
            await polarClient.products.update({
              id: bundleProductId,
              productUpdate: {
                isArchived: true,
              },
            });
          } catch {
          }
        }
      }

      return {
        success: true,
        status: checkout.status,
        orderId: checkoutId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process checkout';
      throw new Error(errorMessage);
    }
  },
});

export const getCheckout = action({
  args: {
    checkoutId: v.string(),
  },
  returns: v.any(),
  handler: async (_ctx, { checkoutId }) => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      throw new Error('POLAR_ORGANIZATION_TOKEN not set');
    }
    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      const checkout = await polarClient.checkouts.get({ id: checkoutId });
      return checkout;
    } catch {
      return null;
    }
  },
});

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

    const user = await ctx.db
      .query('betterAuth_user')
      .withIndex('id', (q) => q.eq('id', userId))
      .first();
    const userEmail = user?.email;

    const orders = [];

    const userOrders = await ctx.db
      .query('orders')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
    orders.push(...userOrders);

    if (userEmail) {
      const guestOrders = await ctx.db
        .query('orders')
        .withIndex('email', (q) => q.eq('email', userEmail))
        .filter((q) => q.eq(q.field('userId'), undefined))
        .order('desc')
        .collect();
      orders.push(...guestOrders);
    }

    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getOrder = query({
  args: {
    checkoutId: v.string(),
  },
  handler: async (ctx, { checkoutId }) => {
    const order = await ctx.db
      .query('orders')
      .withIndex('checkoutId', (q) => q.eq('checkoutId', checkoutId))
      .first();

    if (!order) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    const userEmail = identity?.email;

    const isOwner = userId && order.userId === userId;
    const isGuestMatch = !userId && userEmail && order.email === userEmail;

    if (!isOwner && !isGuestMatch) {
      throw new Error('Unauthorized: Cannot access this order');
    }

    return order;
  },
});
