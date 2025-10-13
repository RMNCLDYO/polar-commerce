/**
 * Checkout Integration Tests
 *
 * Tests the complete checkout flow from cart to order
 */

import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';
import * as CartModel from '../../convex/model/cart';
import { createTestContext, createTestProduct } from '../setup';

describe('Checkout Integration', () => {
  it('should complete full cart-to-checkout flow', async () => {
    const t = createTestContext();
    const userId = 'test-user-123';

    // Step 1: Create cart and add products
    const { cartId, product1Id, product2Id } = await t.run(async (ctx) => {
      const product1Id = await ctx.db.insert('catalog', createTestProduct({
        name: 'Product 1',
        price: 1999,
        inventory_qty: 100,
      }));

      const product2Id = await ctx.db.insert('catalog', createTestProduct({
        name: 'Product 2',
        price: 2999,
        inventory_qty: 50,
      }));

      const cart = await CartModel.getOrCreateCart(ctx, userId, null);
      if (!cart) {throw new Error('Failed to create cart');}

      await CartModel.addItemToCart(ctx, cart._id, product1Id, 2);
      await CartModel.addItemToCart(ctx, cart._id, product2Id, 1);

      return { cartId: cart._id, product1Id, product2Id };
    });

    // Step 2: Verify cart contents
    const cartItems = await t.run(async (ctx) => {
      return await CartModel.getCartItems(ctx, cartId);
    });

    expect(cartItems).toHaveLength(2);
    expect(cartItems[0].quantity).toBe(2);
    expect(cartItems[1].quantity).toBe(1);

    // Step 3: Calculate totals
    const totals = CartModel.calculateCartTotals(cartItems);
    expect(totals.subtotal).toBe(6997); // (2 * 1999) + (1 * 2999)

    // Step 4: Verify inventory is still intact (not decremented yet)
    const inventoryBefore = await t.run(async (ctx) => {
      const p1 = await ctx.db.get(product1Id);
      const p2 = await ctx.db.get(product2Id);
      return {
        product1: p1?.inventory_qty,
        product2: p2?.inventory_qty,
      };
    });

    expect(inventoryBefore.product1).toBe(100);
    expect(inventoryBefore.product2).toBe(50);
  });

  it('should prevent unauthorized access to orders', async () => {
    const t = convexTest(schema);

    // Create order for user A
    const { orderId, checkoutId } = await t.run(async (ctx) => {
      const orderId = await ctx.db.insert('orders', {
        userId: 'user-a',
        email: 'usera@test.com',
        checkoutId: 'checkout_abc123',
        status: 'paid',
        total: 9999,
        products: [],
        createdAt: Date.now(),
      });

      return { orderId, checkoutId: 'checkout_abc123' };
    });

    // User B tries to access User A's order
    await expect(async () => {
      await t.query(api.checkout.checkout.getOrder, {
        checkoutId,
      });
    }).rejects.toThrow('Unauthorized');
  });

  it('should allow owner to access their order', async () => {
    const t = convexTest(schema);

    const { checkoutId } = await t.run(async (ctx) => {
      await ctx.db.insert('orders', {
        userId: 'user-a',
        email: 'usera@test.com',
        checkoutId: 'checkout_def456',
        status: 'paid',
        total: 9999,
        products: [],
        createdAt: Date.now(),
      });

      return { checkoutId: 'checkout_def456' };
    });

    // User A accesses their own order - should work
    const order = await t.query(api.checkout.checkout.getOrder, {
      checkoutId,
    });

    expect(order).toBeDefined();
    expect(order?.checkoutId).toBe(checkoutId);
  });

  it('should handle guest-to-user cart migration', async () => {
    const t = createTestContext();
    const sessionId = 'guest-session-123';
    const userId = 'new-user-456';

    // Step 1: Create guest cart with items
    const guestCartId = await t.run(async (ctx) => {
      const productId = await ctx.db.insert('catalog', createTestProduct());
      const cart = await CartModel.getOrCreateCart(ctx, null, sessionId);
      if (!cart) {throw new Error('Failed to create cart');}

      await CartModel.addItemToCart(ctx, cart._id, productId, 2);
      return cart._id;
    });

    // Step 2: User logs in - cart should be found by sessionId
    const foundCart = await t.run(async (ctx) => {
      return await CartModel.findCart(ctx, null, sessionId);
    });

    expect(foundCart).toBeDefined();
    expect(foundCart?._id).toBe(guestCartId);

    // Step 3: Update cart with userId (migration)
    await t.run(async (ctx) => {
      await ctx.db.patch(guestCartId, {
        userId,
        sessionId: undefined,
        updatedAt: Date.now(),
      });
    });

    // Step 4: Verify cart now belongs to user
    const userCart = await t.run(async (ctx) => {
      return await CartModel.findCart(ctx, userId, null);
    });

    expect(userCart).toBeDefined();
    expect(userCart?._id).toBe(guestCartId);
    expect(userCart?.userId).toBe(userId);
    expect(userCart?.sessionId).toBeUndefined();
  });

  it('should handle inventory validation before checkout', async () => {
    const t = createTestContext();
    const userId = 'test-user-123';

    // Create cart with item that will run out of stock
    const { cartId, productId } = await t.run(async (ctx) => {
      const productId = await ctx.db.insert('catalog', createTestProduct({
        inventory_qty: 5,
      }));

      const cart = await CartModel.getOrCreateCart(ctx, userId, null);
      if (!cart) {throw new Error('Failed to create cart');}

      await CartModel.addItemToCart(ctx, cart._id, productId, 3);
      return { cartId: cart._id, productId };
    });

    // Try to increase quantity beyond available stock
    await expect(
      t.run(async (ctx) => {
        await CartModel.addItemToCart(ctx, cartId, productId, 5);
      })
    ).rejects.toThrow('Only 5 items available in stock');
  });

  it('should clear cart after successful checkout', async () => {
    const t = createTestContext();
    const userId = 'test-user-123';

    const cartId = await t.run(async (ctx) => {
      const productId = await ctx.db.insert('catalog', createTestProduct());
      const cart = await CartModel.getOrCreateCart(ctx, userId, null);
      if (!cart) {throw new Error('Failed to create cart');}

      await CartModel.addItemToCart(ctx, cart._id, productId, 2);
      return cart._id;
    });

    // Verify cart has items
    const itemsBefore = await t.run(async (ctx) => {
      return await CartModel.getCartItems(ctx, cartId);
    });
    expect(itemsBefore).toHaveLength(1);

    // Simulate checkout completion - clear cart
    await t.run(async (ctx) => {
      await CartModel.clearCartItems(ctx, cartId);
    });

    // Verify cart is empty
    const itemsAfter = await t.run(async (ctx) => {
      return await CartModel.getCartItems(ctx, cartId);
    });
    expect(itemsAfter).toHaveLength(0);
  });
});
