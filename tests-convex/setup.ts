/**
 * Test setup and utilities
 */

import { convexTest } from 'convex-test';
import type { Id } from '../convex/_generated/dataModel';
import schema from '../convex/schema';

// Manually specify modules for convex-test
// This avoids using import.meta.glob which doesn't work in all test environments
const modules = {
  '../convex/_generated/server': () => import('../convex/_generated/server'),
  '../convex/_generated/api': () => import('../convex/_generated/api'),
  '../convex/_generated/dataModel': () => import('../convex/_generated/dataModel'),
  '../convex/model/cart': () => import('../convex/model/cart'),
  '../convex/model/catalog': () => import('../convex/model/catalog'),
  '../convex/model/checkout': () => import('../convex/model/checkout'),
  '../convex/model/wishlist': () => import('../convex/model/wishlist'),
};

/**
 * Create a test context with the schema
 */
export function createTestContext() {
  return convexTest(schema, modules);
}

/**
 * Create a test user identity
 */
export function createTestUser(userId: string = 'test-user-123', email: string = 'test@example.com') {
  return {
    subject: userId,
    email,
    name: 'Test User',
    emailVerified: true,
    tokenIdentifier: `test-token-${userId}`,
  };
}

/**
 * Create test product data
 */
export function createTestProduct(overrides?: Partial<any>) {
  return {
    name: 'Test Product',
    price: 1999,
    category: 'test',
    imageUrl: 'https://example.com/image.jpg',
    description: 'A test product',
    isActive: true,
    inStock: true,
    inventory_qty: 100,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create test cart data
 */
export function createTestCart(userId?: string, sessionId?: string, overrides?: Partial<any>) {
  return {
    userId,
    sessionId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    expiresAt: sessionId ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    ...overrides,
  };
}

/**
 * Create test cart item data
 */
export function createTestCartItem(
  cartId: Id<'carts'>,
  catalogId: Id<'catalog'>,
  quantity: number = 1,
  overrides?: Partial<any>
) {
  return {
    cartId,
    catalogId,
    quantity,
    price: 1999,
    addedAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Helper to insert test data
 */
export async function seedTestData(ctx: any) {
  // Insert test product
  const productId = await ctx.db.insert('catalog', createTestProduct());

  // Insert test cart
  const cartId = await ctx.db.insert('carts', createTestCart('test-user-123'));

  return { productId, cartId };
}
