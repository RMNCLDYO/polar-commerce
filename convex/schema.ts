import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const vMetadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null()
);

export default defineSchema({
  catalog: defineTable({
    name: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    polarImageUrl: v.optional(v.string()),
    polarImageId: v.optional(v.string()),
    description: v.string(),
    polarProductId: v.optional(v.string()),
    isActive: v.boolean(),
    inStock: v.boolean(),
    inventory_qty: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('category', ['category'])
    .index('polarProductId', ['polarProductId'])
    .index('isActive', ['isActive'])
    .index('inStock', ['inStock']),

  carts: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    lastCheckoutId: v.optional(v.string()),
    lastCheckoutUrl: v.optional(v.string()),
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    customFieldData: v.optional(v.record(v.string(), vMetadataValue)),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index('userId', ['userId'])
    .index('sessionId', ['sessionId'])
    .index('expiresAt', ['expiresAt']),

  cartItems: defineTable({
    cartId: v.id('carts'),
    catalogId: v.id('catalog'),
    quantity: v.number(),
    price: v.number(),
    addedAt: v.number(),
    updatedAt: v.number(),
  })
    .index('cartId_catalogId', ['cartId', 'catalogId']),

  wishlists: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index('userId', ['userId'])
    .index('sessionId', ['sessionId'])
    .index('expiresAt', ['expiresAt']),

  wishlistItems: defineTable({
    wishlistId: v.id('wishlists'),
    catalogId: v.id('catalog'),
    addedAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index('wishlistId_catalogId', ['wishlistId', 'catalogId']),

  orders: defineTable({
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    checkoutId: v.string(),
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

    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('userId', ['userId'])
    .index('email', ['email'])
    .index('checkoutId', ['checkoutId'])
    .index('customerId', ['customerId'])
    .index('status', ['status'])
    .index('createdAt', ['createdAt'])
    .index('subscriptionId', ['subscriptionId']),

  rateLimits: defineTable({
    key: v.string(),
    requests: v.array(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.number(),
  })
    .index('key', ['key'])
    .index('expiresAt', ['expiresAt']),
});
