/**
 * Wishlist Model Tests
 */

import { describe, it, expect } from 'vitest';
import * as WishlistModel from '../../model/wishlist';
import { createTestContext, createTestProduct } from '../setup';

describe('Wishlist Model', () => {
  describe('getOrCreateWishlist', () => {
    it('should create a new wishlist for authenticated user', async () => {
      const t = createTestContext();
      const userId = 'test-user-123';

      const wishlist = await t.run(async (ctx) => {
        return await WishlistModel.getOrCreateWishlist(ctx, userId, null);
      });

      expect(wishlist).toBeDefined();
      expect(wishlist?.userId).toBe(userId);
      expect(wishlist?.sessionId).toBeUndefined();
    });

    it('should create a new wishlist for guest with sessionId', async () => {
      const t = createTestContext();
      const sessionId = 'session-abc-123';

      const wishlist = await t.run(async (ctx) => {
        return await WishlistModel.getOrCreateWishlist(ctx, null, sessionId);
      });

      expect(wishlist).toBeDefined();
      expect(wishlist?.sessionId).toBe(sessionId);
      expect(wishlist?.userId).toBeUndefined();
      expect(wishlist?.expiresAt).toBeDefined();
    });

    it('should return existing wishlist if it already exists', async () => {
      const t = createTestContext();
      const userId = 'test-user-123';

      const wishlist1 = await t.run(async (ctx) => {
        return await WishlistModel.getOrCreateWishlist(ctx, userId, null);
      });

      const wishlist2 = await t.run(async (ctx) => {
        return await WishlistModel.getOrCreateWishlist(ctx, userId, null);
      });

      expect(wishlist1?._id).toBe(wishlist2?._id);
    });
  });

  describe('findWishlist', () => {
    it('should find wishlist by userId', async () => {
      const t = createTestContext();
      const userId = 'test-user-123';

      await t.run(async (ctx) => {
        await ctx.db.insert('wishlists', {
          userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const wishlist = await t.run(async (ctx) => {
        return await WishlistModel.findWishlist(ctx, userId, null);
      });

      expect(wishlist).toBeDefined();
      expect(wishlist?.userId).toBe(userId);
    });

    it('should find wishlist by sessionId', async () => {
      const t = createTestContext();
      const sessionId = 'session-abc';

      await t.run(async (ctx) => {
        await ctx.db.insert('wishlists', {
          sessionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      });

      const wishlist = await t.run(async (ctx) => {
        return await WishlistModel.findWishlist(ctx, null, sessionId);
      });

      expect(wishlist).toBeDefined();
      expect(wishlist?.sessionId).toBe(sessionId);
    });

    it('should return null if wishlist not found', async () => {
      const t = createTestContext();

      const wishlist = await t.run(async (ctx) => {
        return await WishlistModel.findWishlist(ctx, 'nonexistent', null);
      });

      expect(wishlist).toBeNull();
    });
  });

  describe('addItemToWishlist', () => {
    it('should add item to wishlist successfully', async () => {
      const t = createTestContext();

      const { wishlistId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct());
        const wishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return { wishlistId, productId };
      });

      await t.run(async (ctx) => {
        await WishlistModel.addItemToWishlist(ctx, wishlistId, productId, 'Love this!');
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('wishlistItems')
          .withIndex('wishlistId', (q) => q.eq('wishlistId', wishlistId))
          .collect();
      });

      expect(items).toHaveLength(1);
      expect(items[0].catalogId).toBe(productId);
      expect(items[0].notes).toBe('Love this!');
    });

    it('should throw error if product not found', async () => {
      const t = createTestContext();

      const wishlistId = await t.run(async (ctx) => {
        return await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await expect(
        t.run(async (ctx) => {
          await WishlistModel.addItemToWishlist(ctx, wishlistId, 'invalid-id' as any);
        })
      ).rejects.toThrow('Product not found');
    });

    it('should throw error if product is inactive', async () => {
      const t = createTestContext();

      const { wishlistId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct({ isActive: false }));
        const wishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return { wishlistId, productId };
      });

      await expect(
        t.run(async (ctx) => {
          await WishlistModel.addItemToWishlist(ctx, wishlistId, productId);
        })
      ).rejects.toThrow('Product not found or inactive');
    });

    it('should throw error if item already in wishlist', async () => {
      const t = createTestContext();

      const { wishlistId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct());
        const wishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('wishlistItems', {
          wishlistId,
          catalogId: productId,
          addedAt: Date.now(),
        });

        return { wishlistId, productId };
      });

      await expect(
        t.run(async (ctx) => {
          await WishlistModel.addItemToWishlist(ctx, wishlistId, productId);
        })
      ).rejects.toThrow('Item already in wishlist');
    });
  });

  describe('removeItemFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      const t = createTestContext();

      const { wishlistId, productId } = await t.run(async (ctx) => {
        const productId = await ctx.db.insert('catalog', createTestProduct());
        const wishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('wishlistItems', {
          wishlistId,
          catalogId: productId,
          addedAt: Date.now(),
        });

        return { wishlistId, productId };
      });

      await t.run(async (ctx) => {
        await WishlistModel.removeItemFromWishlist(ctx, wishlistId, productId);
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('wishlistItems')
          .withIndex('wishlistId', (q) => q.eq('wishlistId', wishlistId))
          .collect();
      });

      expect(items).toHaveLength(0);
    });
  });

  describe('clearWishlistItems', () => {
    it('should remove all items from wishlist', async () => {
      const t = createTestContext();

      const wishlistId = await t.run(async (ctx) => {
        const product1 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 1' }));
        const product2 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 2' }));
        const wishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('wishlistItems', {
          wishlistId,
          catalogId: product1,
          addedAt: Date.now(),
        });

        await ctx.db.insert('wishlistItems', {
          wishlistId,
          catalogId: product2,
          addedAt: Date.now(),
        });

        return wishlistId;
      });

      await t.run(async (ctx) => {
        await WishlistModel.clearWishlistItems(ctx, wishlistId);
      });

      const items = await t.run(async (ctx) => {
        return await ctx.db
          .query('wishlistItems')
          .withIndex('wishlistId', (q) => q.eq('wishlistId', wishlistId))
          .collect();
      });

      expect(items).toHaveLength(0);
    });
  });

  describe('mergeWishlists', () => {
    it('should merge guest wishlist into user wishlist', async () => {
      const t = createTestContext();

      const { guestWishlistId, userWishlistId, product1, product2 } = await t.run(async (ctx) => {
        const product1 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 1' }));
        const product2 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 2' }));

        const guestWishlistId = await ctx.db.insert('wishlists', {
          sessionId: 'guest-session',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });

        const userWishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Add items to guest wishlist
        await ctx.db.insert('wishlistItems', {
          wishlistId: guestWishlistId,
          catalogId: product1,
          addedAt: Date.now(),
        });

        await ctx.db.insert('wishlistItems', {
          wishlistId: guestWishlistId,
          catalogId: product2,
          addedAt: Date.now(),
        });

        return { guestWishlistId, userWishlistId, product1, product2 };
      });

      await t.run(async (ctx) => {
        await WishlistModel.mergeWishlists(ctx, guestWishlistId, userWishlistId);
      });

      // Check that guest wishlist is deleted
      const guestWishlist = await t.run(async (ctx) => {
        return await ctx.db.get(guestWishlistId);
      });
      expect(guestWishlist).toBeNull();

      // Check that items are moved to user wishlist
      const userItems = await t.run(async (ctx) => {
        return await ctx.db
          .query('wishlistItems')
          .withIndex('wishlistId', (q) => q.eq('wishlistId', userWishlistId))
          .collect();
      });

      expect(userItems).toHaveLength(2);
    });

    it('should not duplicate items that already exist', async () => {
      const t = createTestContext();

      const { guestWishlistId, userWishlistId, product1 } = await t.run(async (ctx) => {
        const product1 = await ctx.db.insert('catalog', createTestProduct({ name: 'Product 1' }));

        const guestWishlistId = await ctx.db.insert('wishlists', {
          sessionId: 'guest-session',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });

        const userWishlistId = await ctx.db.insert('wishlists', {
          userId: 'user-123',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Add same product to both wishlists
        await ctx.db.insert('wishlistItems', {
          wishlistId: guestWishlistId,
          catalogId: product1,
          addedAt: Date.now(),
        });

        await ctx.db.insert('wishlistItems', {
          wishlistId: userWishlistId,
          catalogId: product1,
          addedAt: Date.now(),
        });

        return { guestWishlistId, userWishlistId, product1 };
      });

      await t.run(async (ctx) => {
        await WishlistModel.mergeWishlists(ctx, guestWishlistId, userWishlistId);
      });

      // Should still have only one item
      const userItems = await t.run(async (ctx) => {
        return await ctx.db
          .query('wishlistItems')
          .withIndex('wishlistId', (q) => q.eq('wishlistId', userWishlistId))
          .collect();
      });

      expect(userItems).toHaveLength(1);
    });
  });
});
