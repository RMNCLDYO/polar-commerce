import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  query,
} from '../_generated/server';
import { trackCartOperation } from '../lib/metrics';
import { checkRateLimit } from '../lib/rateLimit';
import {
  validateQuantity,
  vSuccessResponse,
  vCartResponse,
  vCartValidationResponse,
} from '../utils/validation';

// Helper to get or create cart for a user/session
async function getOrCreateCart(
  ctx: MutationCtx,
  userId?: string | null,
  sessionId?: string | null,
) {
  let cart: Doc<'carts'> | null = null;

  // Try to find existing cart
  if (userId) {
    cart = await ctx.db
      .query('carts')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    cart = await ctx.db
      .query('carts')
      .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
      .first();
  }

  // Create new cart if not found
  if (!cart) {
    const cartId = await ctx.db.insert('carts', {
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: sessionId ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined, // 30 days for guest carts
    });
    cart = await ctx.db.get(cartId);
  }

  return cart;
}

// Add item to cart
export const addToCart = mutation({
  args: {
    catalogId: v.id('catalog'),
    quantity: v.number(),
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    return await trackCartOperation(
      ctx,
      'addToCart',
      async () => {
        // Get current user from auth
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;

        if (!userId && !args.sessionId) {
          throw new Error('User must be authenticated or provide a session ID');
        }

        // Rate limiting
        await checkRateLimit(ctx, 'cart', userId, args.sessionId);

        // Get or create cart
        const cart = await getOrCreateCart(ctx, userId, args.sessionId);
        if (!cart) {
          throw new Error('Failed to create cart');
        }

        // Get product to verify it exists and get current price
        const product = await ctx.db.get(args.catalogId);
        if (!product || !product.isActive) {
          throw new Error('Product not found or inactive');
        }

        // Check inventory
        if (!product.inStock || product.inventory_qty <= 0) {
          throw new Error('Product is out of stock');
        }

        // Check if item already in cart
        const existingItem = await ctx.db
          .query('cartItems')
          .withIndex('cartId_catalogId', (q) =>
            q.eq('cartId', cart._id).eq('catalogId', args.catalogId),
          )
          .first();

        const newQuantity = existingItem
          ? existingItem.quantity + args.quantity
          : args.quantity;

        validateQuantity(newQuantity, product.inventory_qty, product.name);

        if (existingItem) {
          // Update quantity
          await ctx.db.patch(existingItem._id, {
            quantity: newQuantity,
            updatedAt: Date.now(),
          });
        } else {
          // Add new item
          await ctx.db.insert('cartItems', {
            cartId: cart._id,
            catalogId: args.catalogId,
            quantity: args.quantity,
            price: product.price,
            addedAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        // Update cart timestamp
        await ctx.db.patch(cart._id, {
          updatedAt: Date.now(),
        });

        return { success: true };
      },
      {
        catalogId: args.catalogId,
        quantity: args.quantity,
      },
    );
  },
});

// Update cart item quantity
export const updateCartItem = mutation({
  args: {
    catalogId: v.id('catalog'),
    quantity: v.number(),
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    return await trackCartOperation(
      ctx,
      'updateCartItem',
      async () => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;

        if (!userId && !args.sessionId) {
          throw new Error('User must be authenticated or provide a session ID');
        }

        // Find cart
        let cart: Doc<'carts'> | null = null;
        if (userId) {
          cart = await ctx.db
            .query('carts')
            .withIndex('userId', (q) => q.eq('userId', userId))
            .first();
        } else if (args.sessionId) {
          cart = await ctx.db
            .query('carts')
            .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
            .first();
        }

        if (!cart) {
          throw new Error('Cart not found');
        }

        // Find cart item
        const cartItem = await ctx.db
          .query('cartItems')
          .withIndex('cartId_catalogId', (q) =>
            q.eq('cartId', cart._id).eq('catalogId', args.catalogId),
          )
          .first();

        if (!cartItem) {
          throw new Error('Item not in cart');
        }

        if (args.quantity <= 0) {
          // Remove item if quantity is 0 or less
          await ctx.db.delete(cartItem._id);
        } else {
          // Update quantity
          await ctx.db.patch(cartItem._id, {
            quantity: args.quantity,
            updatedAt: Date.now(),
          });
        }

        // Update cart timestamp
        await ctx.db.patch(cart._id, {
          updatedAt: Date.now(),
        });

        return { success: true };
      },
      {
        catalogId: args.catalogId,
        quantity: args.quantity,
      },
    );
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    return await trackCartOperation(
      ctx,
      'removeFromCart',
      async () => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;

        if (!userId && !args.sessionId) {
          throw new Error('User must be authenticated or provide a session ID');
        }

        // Find cart
        let cart: Doc<'carts'> | null = null;
        if (userId) {
          cart = await ctx.db
            .query('carts')
            .withIndex('userId', (q) => q.eq('userId', userId))
            .first();
        } else if (args.sessionId) {
          cart = await ctx.db
            .query('carts')
            .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
            .first();
        }

        if (!cart) {
          throw new Error('Cart not found');
        }

        // Find and delete cart item
        const cartItem = await ctx.db
          .query('cartItems')
          .withIndex('cartId_catalogId', (q) =>
            q.eq('cartId', cart._id).eq('catalogId', args.catalogId),
          )
          .first();

        if (cartItem) {
          await ctx.db.delete(cartItem._id);

          // Update cart timestamp
          await ctx.db.patch(cart._id, {
            updatedAt: Date.now(),
          });
        }

        return { success: true };
      },
      {
        catalogId: args.catalogId,
      },
    );
  },
});

// Clear entire cart
export const clearCart = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    return await trackCartOperation(
      ctx,
      'clearCart',
      async () => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;

        if (!userId && !args.sessionId) {
          throw new Error('User must be authenticated or provide a session ID');
        }

        // Find cart
        let cart: Doc<'carts'> | null = null;
        if (userId) {
          cart = await ctx.db
            .query('carts')
            .withIndex('userId', (q) => q.eq('userId', userId))
            .first();
        } else if (args.sessionId) {
          cart = await ctx.db
            .query('carts')
            .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
            .first();
        }

        if (!cart) {
          return { success: true }; // No cart to clear
        }

        // Delete all cart items
        const cartItems = await ctx.db
          .query('cartItems')
          .withIndex('cartId', (q) => q.eq('cartId', cart._id))
          .collect();

        for (const item of cartItems) {
          await ctx.db.delete(item._id);
        }

        // Update cart timestamp
        await ctx.db.patch(cart._id, {
          updatedAt: Date.now(),
        });

        return { success: true };
      },
      {},
    );
  },
});

// Get cart with items
export const getCart = query({
  args: {
    sessionId: v.optional(v.string()),
  },
  returns: v.union(vCartResponse, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      return null;
    }

    // Find cart
    let cart: Doc<'carts'> | null = null;
    if (userId) {
      cart = await ctx.db
        .query('carts')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .first();
    } else if (args.sessionId) {
      cart = await ctx.db
        .query('carts')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .first();
    }

    if (!cart) {
      return null;
    }

    // Get cart items with product details
    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId', (q) => q.eq('cartId', cart._id))
      .collect();

    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.catalogId);
        if (!product) {return null;}

        return {
          _id: item._id,
          _creationTime: item._creationTime,
          cartId: item.cartId,
          catalogId: item.catalogId,
          quantity: item.quantity,
          price: item.price,
          addedAt: item.addedAt,
          updatedAt: item.updatedAt,
          product: {
            _id: product._id,
            _creationTime: product._creationTime,
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: product.polarImageUrl || product.imageUrl || '',
            polarImageUrl: product.polarImageUrl,
            polarImageId: product.polarImageId,
            description: product.description,
            polarProductId: product.polarProductId,
            isActive: product.isActive,
            inStock: product.inStock,
            inventory_qty: product.inventory_qty,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
        };
      }),
    );

    // Filter out null items (deleted products)
    const validItems = itemsWithProducts.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    // Calculate totals
    const subtotal = validItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0,
    );

    const itemCount = validItems.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0,
    );

    return {
      id: cart._id,
      items: validItems,
      subtotal,
      itemCount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  },
});

// Get cart item count (for header badge)
export const getCartCount = query({
  args: {
    sessionId: v.optional(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      return 0;
    }

    // Find cart
    let cart: Doc<'carts'> | null = null;
    if (userId) {
      cart = await ctx.db
        .query('carts')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .first();
    } else if (args.sessionId) {
      cart = await ctx.db
        .query('carts')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .first();
    }

    if (!cart) {
      return 0;
    }

    // Get cart items and sum quantities
    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId', (q) => q.eq('cartId', cart._id))
      .collect();

    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
});

// Merge guest cart with user cart on login
export const mergeCart = mutation({
  args: {
    sessionId: v.string(),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new Error('User must be authenticated');
    }

    // Find guest cart
    const guestCart = await ctx.db
      .query('carts')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!guestCart) {
      return { success: true }; // No guest cart to merge
    }

    // Get or create user cart
    const userCart = await getOrCreateCart(ctx, userId, null);
    if (!userCart) {
      throw new Error('Failed to create user cart');
    }

    // If they're the same cart, just update the userId
    if (guestCart._id === userCart._id) {
      await ctx.db.patch(guestCart._id, {
        userId,
        sessionId: undefined,
        updatedAt: Date.now(),
      });
      return { success: true };
    }

    // Get items from guest cart
    const guestItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId', (q) => q.eq('cartId', guestCart._id))
      .collect();

    // Merge items into user cart
    for (const guestItem of guestItems) {
      const existingItem = await ctx.db
        .query('cartItems')
        .withIndex('cartId_catalogId', (q) =>
          q.eq('cartId', userCart._id).eq('catalogId', guestItem.catalogId),
        )
        .first();

      if (existingItem) {
        // Combine quantities
        await ctx.db.patch(existingItem._id, {
          quantity: existingItem.quantity + guestItem.quantity,
          updatedAt: Date.now(),
        });
      } else {
        // Move item to user cart
        await ctx.db.insert('cartItems', {
          cartId: userCart._id,
          catalogId: guestItem.catalogId,
          quantity: guestItem.quantity,
          price: guestItem.price,
          addedAt: guestItem.addedAt,
          updatedAt: Date.now(),
        });
      }

      // Delete guest cart item
      await ctx.db.delete(guestItem._id);
    }

    // Delete guest cart
    await ctx.db.delete(guestCart._id);

    // Update user cart timestamp
    await ctx.db.patch(userCart._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Validate cart before checkout
export const validateCart = query({
  args: {
    sessionId: v.optional(v.string()),
  },
  returns: vCartValidationResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      return {
        valid: false,
        errors: ['Cart is empty'],
      };
    }

    // Find cart
    let cart: Doc<'carts'> | null = null;
    if (userId) {
      cart = await ctx.db
        .query('carts')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .first();
    } else if (args.sessionId) {
      cart = await ctx.db
        .query('carts')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .first();
    }

    if (!cart) {
      return {
        valid: false,
        errors: ['Cart is empty'],
      };
    }

    // Get cart items with product details
    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId', (q) => q.eq('cartId', cart._id))
      .collect();

    if (cartItems.length === 0) {
      return {
        valid: false,
        errors: ['Cart is empty'],
      };
    }

    const errors: string[] = [];
    const validItems: Array<Doc<'cartItems'> & { product: Doc<'catalog'> }> =
      [];

    // Check each item
    for (const item of cartItems) {
      const product = await ctx.db.get(item.catalogId);
      if (!product) {
        errors.push('One or more products no longer exist');
        continue;
      }

      if (!product.isActive) {
        errors.push(`${product.name} is no longer available`);
      }

      // Check if price has changed
      if (item.price !== product.price) {
        errors.push(
          `Price for ${product.name} has changed from $${(item.price / 100).toFixed(2)} to $${(product.price / 100).toFixed(2)}`,
        );
      }

      validItems.push({
        ...item,
        product,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      itemCount: validItems.length,
    };
  },
});

// ============================================
// INTERNAL QUERIES/MUTATIONS FOR CHECKOUT
// ============================================
// These are used by the checkout actions to access cart data

export const internal_getCartByUserId = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('carts')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
  },
});

export const internal_getCartBySessionId = internalQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query('carts')
      .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
      .first();
  },
});

export const internal_getCartItems = internalQuery({
  args: {
    cartId: v.id('carts'),
  },
  handler: async (ctx, { cartId }) => {
    const items = await ctx.db
      .query('cartItems')
      .withIndex('cartId', (q) => q.eq('cartId', cartId))
      .collect();

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.catalogId);
        if (!product) {return null;}

        return {
          ...item,
          product,
        };
      }),
    );

    return itemsWithProducts.filter(Boolean);
  },
});

export const internal_getAuthUser = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    // Query the Better Auth user table directly using index
    const user = await ctx.db
      .query('betterAuth_user')
      .withIndex('id', (q) => q.eq('id', userId))
      .first();
    return user;
  },
});

export const internal_updateCartCheckout = internalMutation({
  args: {
    cartId: v.id('carts'),
    checkoutId: v.string(),
    checkoutUrl: v.string(),
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    customFieldData: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const updateData: {
      lastCheckoutId: string;
      lastCheckoutUrl: string;
      updatedAt: number;
      discountId?: string;
      discountCode?: string;
      customFieldData?: typeof args.customFieldData;
    } = {
      lastCheckoutId: args.checkoutId,
      lastCheckoutUrl: args.checkoutUrl,
      updatedAt: Date.now(),
    };

    if (args.discountId) {updateData.discountId = args.discountId;}
    if (args.discountCode) {updateData.discountCode = args.discountCode;}
    if (args.customFieldData) {updateData.customFieldData = args.customFieldData;}

    await ctx.db.patch(args.cartId, updateData);
  },
});

export const internal_clearCartItems = internalMutation({
  args: {
    cartId: v.id('carts'),
  },
  handler: async (ctx, { cartId }) => {
    const items = await ctx.db
      .query('cartItems')
      .withIndex('cartId', (q) => q.eq('cartId', cartId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.patch(cartId, {
      updatedAt: Date.now(),
    });
  },
});

export const internal_createOrder = internalMutation({
  args: {
    checkoutId: v.string(),
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    customerId: v.optional(v.string()),
    status: v.string(),

    // Amounts
    amount: v.number(),
    discountAmount: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    currency: v.string(),

    // Products
    products: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),

    // Customer details
    customerName: v.optional(v.string()),
    customerIpAddress: v.optional(v.string()),
    isBusinessCustomer: v.optional(v.boolean()),
    customerTaxId: v.optional(v.string()),
    billingAddress: v.optional(
      v.object({
        line1: v.optional(v.string()),
        line2: v.optional(v.string()),
        postal_code: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        country: v.string(),
      }),
    ),

    // Discount
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),

    // Trial info
    trialInterval: v.optional(v.string()),
    trialIntervalCount: v.optional(v.number()),
    trialEnd: v.optional(v.number()),

    // Subscription
    subscriptionId: v.optional(v.string()),

    // Metadata
    metadata: v.optional(v.record(v.string(), v.any())),
    customFieldData: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    // Check if order already exists
    const existingOrder = await ctx.db
      .query('orders')
      .withIndex('checkoutId', (q) => q.eq('checkoutId', args.checkoutId))
      .first();

    const orderData: {
      status: string;
      email?: string;
      completedAt?: number;
      amount: number;
      discountAmount?: number;
      taxAmount?: number;
      totalAmount: number;
      currency: string;
      customerName?: string;
      customerIpAddress?: string;
      isBusinessCustomer?: boolean;
      customerTaxId?: string;
      billingAddress?: typeof args.billingAddress;
      discountId?: string;
      discountCode?: string;
      trialInterval?: string;
      trialIntervalCount?: number;
      trialEnd?: number;
      subscriptionId?: string;
      metadata?: typeof args.metadata;
      customFieldData?: typeof args.customFieldData;
    } = {
      status: args.status,
      email: args.email,
      completedAt: args.status === 'succeeded' ? Date.now() : undefined,

      // Amounts
      amount: args.amount,
      discountAmount: args.discountAmount,
      taxAmount: args.taxAmount,
      totalAmount: args.totalAmount || args.amount,
      currency: args.currency,

      // Customer details
      customerName: args.customerName,
      customerIpAddress: args.customerIpAddress,
      isBusinessCustomer: args.isBusinessCustomer,
      customerTaxId: args.customerTaxId,
      billingAddress: args.billingAddress,

      // Discount
      discountId: args.discountId,
      discountCode: args.discountCode,

      // Trial
      trialInterval: args.trialInterval,
      trialIntervalCount: args.trialIntervalCount,
      trialEnd: args.trialEnd,

      // Subscription
      subscriptionId: args.subscriptionId,

      // Metadata
      metadata: args.metadata,
      customFieldData: args.customFieldData,
    };

    if (existingOrder) {
      // Update existing order
      await ctx.db.patch(existingOrder._id, orderData);
      return existingOrder._id;
    }

    // Create new order
    return await ctx.db.insert('orders', {
      checkoutId: args.checkoutId,
      userId: args.userId,
      customerId: args.customerId,
      products: args.products,
      createdAt: Date.now(),
      ...orderData,
    });
  },
});
