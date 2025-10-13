/**
 * Cart Model Tests
 */

import { describe, it, expect } from 'vitest';
import * as CartModel from '../../model/cart';
import { createTestContext, createTestProduct, createTestCart } from '../setup';

describe('Cart Model', () => {
  describe('getOrCreateCart', () => {
    it('should create a new cart for authenticated user', async () => {
      const t = createTestContext();
      const userId = 'test-user-123';

      const cart = await t.run(async (ctx) => {
        return await CartModel.getOrCreateCart(ctx, userId, null);
      });

      expect(cart).toBeDefined();
      expect(cart?.userId).toBe(userId);
      expect(cart?.sessionId).toBeUndefined();
    });

    it('should create a new cart for guest with sessionId', async () => {
      const t = createTestContext();
      const sessionId = 'session-abc-123';

      const cart = await t.run(async (ctx) => {
        return await CartModel.getOrCreateCart(ctx, null, sessionId);
      });

      expect(cart).toBeDefined();
      expect(cart?.sessionId).toBe(sessionId);
      expect(cart?.userId).toBeUndefined();
      expect(cart?.expiresAt).toBeDefined();
    });

    it('should return existing cart if it already exists', async () => {
      const t = createTestContext();
      const userId = 'test-user-123';

      const cart1 = await t.run(async (ctx) => {
        return await CartModel.getOrCreateCart(ctx, userId, null);
      });

      const cart2 = await t.run(async (ctx) => {
        return await CartModel.getOrCreateCart(ctx, userId, null);
      });

      expect(cart1?._id).toBe(cart2?._id);
    });
  });

  describe('findCart', () => {
    it('should find cart by userId', async () => {
      const t = createTestContext();
      const userId = 'test-user-123';

      await t.run(async (ctx) => {
        await ctx.db.insert('carts', createTestCart(userId));
      });

      const cart = await t.run(async (ctx) => {
        return await CartModel.findCart(ctx, userId, null);
      });

      expect(cart).toBeDefined();
      expect(cart?.userId).toBe(userId);
    });

    it('should find cart by sessionId', async () => {
      const t = createTestContext();
      const sessionId = 'session-abc';

      await t.run(async (ctx) => {
        await ctx.db.insert('carts', createTestCart(undefined, sessionId));
      });

      const cart = await t.run(async (ctx) => {
        return await CartModel.findCart(ctx, null, sessionId);
      });

      expect(cart).toBeDefined();
      expect(cart?.sessionId).toBe(sessionId);
    });

    it('should return null if cart not found', async () => {
      const t = createTestContext();

      const cart = await t.run(async (ctx) => {
        return await CartModel.findCart(ctx, 'nonexistent', null);
      });

      expect(cart).toBeNull();
    });
  });

  describe('addItemToCart', () => {
    it('should add item to cart successfully', async () => {
      const t = createTestContext();

      const { cartId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct());
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));
        return { cartId, productId };
      });

      await t.run(async (ctx) => {
        await CartModel.addItemToCart(ctx, cartId, productId, 2);
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('cartItems')
          .withIndex('cartId', (q) => q.eq('cartId', cartId))
          .collect();
      });

      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
      expect(items[0].catalogId).toBe(productId);
    });

    it('should throw error if product not found', async () => {
      const t = createTestContext();

      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', createTestCart('user-123'));
      });

      await expect(
        t.run(async (ctx) => {
          await CartModel.addItemToCart(ctx, cartId, 'invalid-id' as any, 1);
        })
      ).rejects.toThrow('Product not found');
    });

    it('should throw error if product is inactive', async () => {
      const t = createTestContext();

      const { cartId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct({ isActive: false }));
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));
        return { cartId, productId };
      });

      await expect(
        t.run(async (ctx) => {
          await CartModel.addItemToCart(ctx, cartId, productId, 1);
        })
      ).rejects.toThrow('Product not found or inactive');
    });

    it('should throw error if quantity exceeds inventory', async () => {
      const t = createTestContext();

      const { cartId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct({ inventory_qty: 5 }));
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));
        return { cartId, productId };
      });

      await expect(
        t.run(async (ctx) => {
          await CartModel.addItemToCart(ctx, cartId, productId, 10);
        })
      ).rejects.toThrow('Only 5 items available in stock');
    });

    it('should update quantity if item already in cart', async () => {
      const t = createTestContext();

      const { cartId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct({ inventory_qty: 100 }));
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));
        return { cartId, productId };
      });

      // Add item first time
      await t.run(async (ctx) => {
        await CartModel.addItemToCart(ctx, cartId, productId, 2);
      });

      // Add same item again
      await t.run(async (ctx) => {
        await CartModel.addItemToCart(ctx, cartId, productId, 3);
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('cartItems')
          .withIndex('cartId', (q) => q.eq('cartId', cartId))
          .collect();
      });

      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5); // 2 + 3
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart', async () => {
      const t = createTestContext();

      const { cartId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct());
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));
        await ctx.db.insert('cartItems', {
          cartId,
          catalogId: productId,
          quantity: 2,
          price: 1999,
          addedAt: Date.now(),
          updatedAt: Date.now(),
        });
        return { cartId, productId };
      });

      await t.run(async (ctx) => {
        await CartModel.removeItemFromCart(ctx, cartId, productId);
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('cartItems')
          .withIndex('cartId', (q) => q.eq('cartId', cartId))
          .collect();
      });

      expect(items).toHaveLength(0);
    });

    it('should do nothing if item not in cart', async () => {
      const t = createTestContext();

      const { cartId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct());
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));
        return { cartId, productId };
      });

      // Should not throw
      await t.run(async (ctx) => {
        await CartModel.removeItemFromCart(ctx, cartId, productId);
      });
    });
  });

  describe('clearCartItems', () => {
    it('should remove all items from cart', async () => {
      const t = createTestContext();

      const cartId = await t.run(async (ctx) => {
        const product1 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 1' }));
        const product2 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 2' }));
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));

        await ctx.db.insert('cartItems', {
          cartId,
          catalogId: product1,
          quantity: 1,
          price: 1999,
          addedAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('cartItems', {
          cartId,
          catalogId: product2,
          quantity: 2,
          price: 2999,
          addedAt: Date.now(),
          updatedAt: Date.now(),
        });

        return cartId;
      });

      await t.run(async (ctx) => {
        await CartModel.clearCartItems(ctx, cartId);
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('cartItems')
          .withIndex('cartId', (q) => q.eq('cartId', cartId))
          .collect();
      });

      expect(items).toHaveLength(0);
    });
  });

  describe('calculateCartTotals', () => {
    it('should calculate correct subtotal', () => {
      const items = [
        { quantity: 2, price: 1999 },
        { quantity: 1, price: 2999 },
      ] as any;

      const totals = CartModel.calculateCartTotals(items);

      expect(totals.subtotal).toBe(6997); // (2 * 1999) + (1 * 2999)
    });

    it('should return 0 for empty cart', () => {
      const totals = CartModel.calculateCartTotals([]);
      expect(totals.subtotal).toBe(0);
    });
  });

  describe('getCartItems', () => {
    it('should return all cart items', async () => {
      const t = createTestContext();

      const cartId = await t.run(async (ctx) => {
        const product1 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 1' }));
        const product2 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 2' }));
        const cartId = await ctx.db.insert('carts', createTestCart('user-123'));

        await ctx.db.insert('cartItems', {
          cartId,
          catalogId: product1,
          quantity: 1,
          price: 1999,
          addedAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('cartItems', {
          cartId,
          catalogId: product2,
          quantity: 2,
          price: 2999,
          addedAt: Date.now(),
          updatedAt: Date.now(),
        });

        return cartId;
      });

      const items = await t.run(async (ctx) => {
        return await CartModel.getCartItems(ctx, cartId);
      });

      expect(items).toHaveLength(2);
    });
  });
});
