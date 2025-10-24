import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  query,
} from '../_generated/server';

// Safer metadata type - allows only JSON-serializable primitives
const vMetadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null()
);
import { authComponent } from '../auth/auth';
import { checkRateLimit } from '../lib/rateLimit';
import {
  validateQuantity,
  vSuccessResponse,
  vCartResponse,
  vCartValidationResponse,
  vCartDoc,
  vAuthUser,
  vCartItemWithProduct,
} from '../utils/validation';

async function getOrCreateCart(
  ctx: MutationCtx,
  userId?: string | null,
  sessionId?: string | null,
) {
  let cart: Doc<'carts'> | null = null;

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

  if (!cart) {
    const cartId = await ctx.db.insert('carts', {
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: sessionId ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    cart = await ctx.db.get(cartId);
  }

  return cart;
}

export const addToCart = mutation({
  args: {
    catalogId: v.id('catalog'),
    quantity: v.number(),
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    await checkRateLimit(ctx, 'cart', userId, args.sessionId);

    const cart = await getOrCreateCart(ctx, userId, args.sessionId);
    if (!cart) {
      throw new Error('Failed to create cart');
    }

    const product = await ctx.db.get(args.catalogId);
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    if (!product.inStock || product.inventory_qty <= 0) {
      throw new Error('Product is out of stock');
    }

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
      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('cartItems', {
        cartId: cart._id,
        catalogId: args.catalogId,
        quantity: args.quantity,
        price: product.price,
        addedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(cart._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateCartItem = mutation({
  args: {
    catalogId: v.id('catalog'),
    quantity: v.number(),
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

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
      await ctx.db.delete(cartItem._id);
    } else {
      await ctx.db.patch(cartItem._id, {
        quantity: args.quantity,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(cart._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const removeFromCart = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

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

    const cartItem = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) =>
        q.eq('cartId', cart._id).eq('catalogId', args.catalogId),
      )
      .first();

    if (cartItem) {
      await ctx.db.delete(cartItem._id);

      await ctx.db.patch(cart._id, {
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const clearCart = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

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
      return { success: true };
    }

    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', cart._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.patch(cart._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

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

    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', cart._id))
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

    const validItems = itemsWithProducts.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

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

    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', cart._id))
      .collect();

    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
});

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

    const guestCart = await ctx.db
      .query('carts')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!guestCart) {
      return { success: true };
    }

    const userCart = await getOrCreateCart(ctx, userId, null);
    if (!userCart) {
      throw new Error('Failed to create user cart');
    }

    if (guestCart._id === userCart._id) {
      await ctx.db.patch(guestCart._id, {
        userId,
        sessionId: undefined,
        updatedAt: Date.now(),
      });
      return { success: true };
    }

    const guestItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', guestCart._id))
      .collect();

    for (const guestItem of guestItems) {
      const existingItem = await ctx.db
        .query('cartItems')
        .withIndex('cartId_catalogId', (q) =>
          q.eq('cartId', userCart._id).eq('catalogId', guestItem.catalogId),
        )
        .first();

      if (existingItem) {
        await ctx.db.patch(existingItem._id, {
          quantity: existingItem.quantity + guestItem.quantity,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert('cartItems', {
          cartId: userCart._id,
          catalogId: guestItem.catalogId,
          quantity: guestItem.quantity,
          price: guestItem.price,
          addedAt: guestItem.addedAt,
          updatedAt: Date.now(),
        });
      }

      await ctx.db.delete(guestItem._id);
    }

    await ctx.db.delete(guestCart._id);

    await ctx.db.patch(userCart._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

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

    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', cart._id))
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

    for (const item of cartItems) {
      const product = await ctx.db.get(item.catalogId);
      if (!product) {
        errors.push('One or more products no longer exist');
        continue;
      }

      if (!product.isActive) {
        errors.push(`${product.name} is no longer available`);
      }

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

export const internal_getCartByUserId = internalQuery({
  args: {
    userId: v.string(),
  },
  returns: vCartDoc,
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
  returns: vCartDoc,
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
  returns: v.array(vCartItemWithProduct),
  handler: async (ctx, { cartId }) => {
    const items = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', cartId))
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

    return itemsWithProducts.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const internal_getAuthUser = internalQuery({
  args: {
    userId: v.string(),
  },
  returns: vAuthUser,
  handler: async (ctx, { userId }) => {
    const user = await authComponent.getAnyUserById(ctx, userId);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      name: user.name || undefined,
    };
  },
});

export const internal_updateCartCheckout = internalMutation({
  args: {
    cartId: v.id('carts'),
    checkoutId: v.string(),
    checkoutUrl: v.string(),
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    customFieldData: v.optional(v.record(v.string(), vMetadataValue)),
  },
  returns: v.null(),
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
    return null;
  },
});

export const internal_clearCartItems = internalMutation({
  args: {
    cartId: v.id('carts'),
  },
  returns: v.null(),
  handler: async (ctx, { cartId }) => {
    const items = await ctx.db
      .query('cartItems')
      .withIndex('cartId_catalogId', (q) => q.eq('cartId', cartId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.patch(cartId, {
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const internal_createOrder = internalMutation({
  args: {
    checkoutId: v.string(),
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    customerId: v.optional(v.string()),
    status: v.string(),

    amount: v.number(),
    discountAmount: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    currency: v.string(),

    products: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),

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

    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),

    trialInterval: v.optional(v.string()),
    trialIntervalCount: v.optional(v.number()),
    trialEnd: v.optional(v.number()),

    subscriptionId: v.optional(v.string()),

    metadata: v.optional(v.record(v.string(), vMetadataValue)),
    customFieldData: v.optional(v.record(v.string(), vMetadataValue)),
  },
  returns: v.id('orders'),
  handler: async (ctx, args) => {
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

      amount: args.amount,
      discountAmount: args.discountAmount,
      taxAmount: args.taxAmount,
      totalAmount: args.totalAmount || args.amount,
      currency: args.currency,

      customerName: args.customerName,
      customerIpAddress: args.customerIpAddress,
      isBusinessCustomer: args.isBusinessCustomer,
      customerTaxId: args.customerTaxId,
      billingAddress: args.billingAddress,

      discountId: args.discountId,
      discountCode: args.discountCode,

      trialInterval: args.trialInterval,
      trialIntervalCount: args.trialIntervalCount,
      trialEnd: args.trialEnd,

      subscriptionId: args.subscriptionId,

      metadata: args.metadata,
      customFieldData: args.customFieldData,
    };

    if (existingOrder) {
      await ctx.db.patch(existingOrder._id, orderData);
      return existingOrder._id;
    }

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
