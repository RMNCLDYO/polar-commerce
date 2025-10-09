import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * AISDK STOREFRONT SCHEMA
 *
 * ARCHITECTURE OVERVIEW:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * COMPONENTS (External Dependencies - Isolated Schemas):
 * • betterAuth     → User authentication (tables: betterAuth_*)
 * • resend         → Email service (tables: resend_*)
 * • polar          → Payment & billing (tables: components.polar.*)
 *
 * APP TABLES (Core Business Logic):
 * • catalog        → Product/subscription catalog (synced FROM Polar)
 * • carts/cartItems → Shopping cart system
 * • orders         → Order history and fulfillment
 * • demoTodos      → Example todo feature for demonstrations
 *
 * DATA FLOW:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Seeding:
 *   products.json + subscriptions.json
 *            ↓
 *      scripts/seedAll.ts
 *            ↓
 *       Polar API (source of truth)
 *            ↓
 *    Polar webhooks sync
 *            ↓
 *   components.polar.products
 *            ↓
 *   Augment with e-commerce fields
 *            ↓
 *       catalog table (app)
 *
 * Runtime:
 *   Store pages → query catalog
 *   Cart → references catalog
 *   Checkout → uses catalog.polarProductId for Polar API
 */

export default defineSchema({
  // ==========================================
  // CATALOG (Product & Subscription Catalog)
  // ==========================================
  /**
   * Product and subscription catalog synced FROM Polar.
   *
   * Why this exists:
   * - Polar's schema lacks e-commerce fields (inventory, categories)
   * - We augment Polar products with store-specific data
   * - Single catalog for both products AND subscriptions
   *
   * Contains:
   * - Physical products (Nike shoes, caps, etc.) with inventory
   * - Subscription plans (Starter, Premium) without inventory
   */
  catalog: defineTable({
    name: v.string(),
    price: v.number(), // Store as cents for precision
    category: v.string(),
    imageUrl: v.string(),
    polarImageUrl: v.optional(v.string()), // Polar's public S3 image URL
    polarImageId: v.optional(v.string()), // Polar's file ID for the image
    description: v.string(),
    polarProductId: v.optional(v.string()), // Link to Polar product
    isActive: v.boolean(),
    inStock: v.boolean(), // Whether product is in stock
    inventory_qty: v.number(), // Current inventory quantity
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('category', ['category'])
    .index('polarProductId', ['polarProductId'])
    .index('isActive', ['isActive'])
    .index('inStock', ['inStock']),

  // ==========================================
  // SHOPPING CART
  // ==========================================
  carts: defineTable({
    userId: v.optional(v.string()), // Optional for guest users
    sessionId: v.optional(v.string()), // For anonymous users
    lastCheckoutId: v.optional(v.string()), // Last Polar checkout session ID
    lastCheckoutUrl: v.optional(v.string()), // Last Polar checkout URL
    discountId: v.optional(v.string()), // Applied discount ID
    discountCode: v.optional(v.string()), // Applied discount code
    customFieldData: v.optional(v.record(v.string(), v.any())), // Custom checkout form data
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()), // For cleanup of abandoned carts
  })
    .index('userId', ['userId'])
    .index('sessionId', ['sessionId'])
    .index('expiresAt', ['expiresAt']),

  cartItems: defineTable({
    cartId: v.id('carts'),
    catalogId: v.id('catalog'), // References catalog table
    quantity: v.number(),
    price: v.number(), // Snapshot price at time of adding
    addedAt: v.number(),
    updatedAt: v.number(),
  })
    .index('cartId', ['cartId'])
    .index('cartId_catalogId', ['cartId', 'catalogId']),

  // ==========================================
  // ORDER MANAGEMENT
  // ==========================================
  orders: defineTable({
    userId: v.optional(v.string()),
    email: v.optional(v.string()), // Customer email for guest orders and user linking
    checkoutId: v.string(), // Polar checkout session ID
    customerId: v.optional(v.string()), // Polar customer ID

    // Status and amounts
    status: v.string(), // succeeded, failed, pending, confirmed, expired
    amount: v.number(), // Total amount in cents before discounts
    discountAmount: v.optional(v.number()), // Discount amount in cents
    taxAmount: v.optional(v.number()), // Tax amount in cents
    totalAmount: v.optional(v.number()), // Final total after discounts and tax
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

    // Discount info
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),

    // Trial and subscription info
    trialInterval: v.optional(v.string()), // day, week, month, year
    trialIntervalCount: v.optional(v.number()),
    trialEnd: v.optional(v.number()), // timestamp
    subscriptionId: v.optional(v.string()), // For subscription upgrades

    // Metadata
    metadata: v.optional(v.record(v.string(), v.any())),
    customFieldData: v.optional(v.record(v.string(), v.any())),

    // Timestamps
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

  // ==========================================
  // DEMO FEATURES
  // ==========================================
  /**
   * Demo todos feature for showcasing CRUD operations.
   * Safe to remove in production if not needed.
   */
  demoTodos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('userId', ['userId']),
});
