/**
 * Catalog Security Tests
 *
 * Tests security controls for catalog mutations
 */

import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';

describe('Catalog Security', () => {
  it('should prevent public inventory decrement', async () => {
    const t = convexTest(schema);

    // Create test product
    const productId = await t.run(async (ctx) => {
      return await ctx.db.insert('catalog', {
        name: 'Test Product',
        price: 9999,
        category: 'men',
        imageUrl: '/test.jpg',
        description: 'Test',
        inStock: true,
        inventory_qty: 100,
      });
    });

    // Try to decrement inventory publicly (should fail)
    await expect(async () => {
      await t.mutation(api.catalog.catalog.decrementInventory, {
        productId,
        quantity: 1,
      });
    }).rejects.toThrow();
  });

  it('should require admin for product creation', async () => {
    const t = convexTest(schema);

    // Non-admin tries to create product (should fail)
    await expect(async () => {
      await t.mutation(api.catalog.catalog.createProduct, {
        name: 'Unauthorized Product',
        price: 9999,
        category: 'men',
        imageUrl: '/test.jpg',
        description: 'Should not be created',
        inStock: true,
        inventory_qty: 100,
      });
    }).rejects.toThrow('Unauthorized');
  });

  it('should require admin for product updates', async () => {
    const t = convexTest(schema);

    const productId = await t.run(async (ctx) => {
      return await ctx.db.insert('catalog', {
        name: 'Test Product',
        price: 9999,
        category: 'men',
        imageUrl: '/test.jpg',
        description: 'Test',
        inStock: true,
        inventory_qty: 100,
      });
    });

    // Non-admin tries to update (should fail)
    await expect(async () => {
      await t.mutation(api.catalog.catalog.updateProduct, {
        productId,
        updates: { price: 1 },
      });
    }).rejects.toThrow('Unauthorized');
  });

  it('should require admin for product deletion', async () => {
    const t = convexTest(schema);

    const productId = await t.run(async (ctx) => {
      return await ctx.db.insert('catalog', {
        name: 'Test Product',
        price: 9999,
        category: 'men',
        imageUrl: '/test.jpg',
        description: 'Test',
        inStock: true,
        inventory_qty: 100,
      });
    });

    // Non-admin tries to delete (should fail)
    await expect(async () => {
      await t.mutation(api.catalog.catalog.deleteProduct, {
        productId,
      });
    }).rejects.toThrow('Unauthorized');
  });
});
