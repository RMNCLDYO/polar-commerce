import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { mutation, query } from '../_generated/server';
import * as WishlistModel from '../model/wishlist';
import {
  vSuccessResponse,
  vWishlistResponse,
  vToggleWishlistResponse,
} from '../utils/validation';

export const addToWishlist = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    const wishlist = await WishlistModel.getOrCreateWishlist(ctx, userId, args.sessionId);
    if (!wishlist) {
      throw new Error('Failed to create wishlist');
    }

    await WishlistModel.addItemToWishlist(ctx, wishlist._id, args.catalogId, args.notes);

    return { success: true };
  },
});

export const removeFromWishlist = mutation({
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

    const wishlist = await WishlistModel.findWishlist(ctx, userId, args.sessionId);
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    await WishlistModel.removeItemFromWishlist(ctx, wishlist._id, args.catalogId);

    return { success: true };
  },
});

export const toggleWishlist = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
  },
  returns: vToggleWishlistResponse,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    const wishlist = await WishlistModel.getOrCreateWishlist(ctx, userId, args.sessionId);
    if (!wishlist) {
      throw new Error('Failed to create wishlist');
    }

    const existingItem = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId_catalogId', (q) =>
        q.eq('wishlistId', wishlist._id).eq('catalogId', args.catalogId),
      )
      .first();

    if (existingItem) {
      await WishlistModel.removeItemFromWishlist(ctx, wishlist._id, args.catalogId);
      return { success: true, action: 'removed' as const };
    } else {
      const product = await ctx.db.get(args.catalogId);
      if (!product || !product.isActive) {
        throw new Error('Product not found or inactive');
      }

      await WishlistModel.addItemToWishlist(ctx, wishlist._id, args.catalogId, undefined);
      return { success: true, action: 'added' as const };
    }
  },
});

export const clearWishlist = mutation({
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

    const wishlist = await WishlistModel.findWishlist(ctx, userId, args.sessionId);
    if (!wishlist) {
      return { success: true };
    }

    await WishlistModel.clearWishlistItems(ctx, wishlist._id);

    return { success: true };
  },
});

export const getWishlist = query({
  args: {
    sessionId: v.optional(v.string()),
  },
  returns: v.union(vWishlistResponse, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      return null;
    }

    let wishlist: Doc<'wishlists'> | null = null;
    if (userId) {
      wishlist = await ctx.db
        .query('wishlists')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .first();
    } else if (args.sessionId) {
      wishlist = await ctx.db
        .query('wishlists')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .first();
    }

    if (!wishlist) {
      return null;
    }

    const wishlistItems = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId', (q) => q.eq('wishlistId', wishlist._id))
      .collect();

    const itemsWithProducts = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.catalogId);
        if (!product) {return null;}

        return {
          _id: item._id,
          catalogId: item.catalogId,
          addedAt: item.addedAt,
          notes: item.notes,
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

    const validItems = itemsWithProducts.filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      id: wishlist._id,
      items: validItems,
      itemCount: validItems.length,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  },
});

export const getWishlistCount = query({
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

    let wishlist: Doc<'wishlists'> | null = null;
    if (userId) {
      wishlist = await ctx.db
        .query('wishlists')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .first();
    } else if (args.sessionId) {
      wishlist = await ctx.db
        .query('wishlists')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .first();
    }

    if (!wishlist) {
      return 0;
    }

    const wishlistItems = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId', (q) => q.eq('wishlistId', wishlist._id))
      .collect();

    return wishlistItems.length;
  },
});

export const isInWishlist = query({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      return false;
    }

    let wishlist: Doc<'wishlists'> | null = null;
    if (userId) {
      wishlist = await ctx.db
        .query('wishlists')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .first();
    } else if (args.sessionId) {
      wishlist = await ctx.db
        .query('wishlists')
        .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
        .first();
    }

    if (!wishlist) {
      return false;
    }

    const wishlistItem = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId_catalogId', (q) =>
        q.eq('wishlistId', wishlist._id).eq('catalogId', args.catalogId),
      )
      .first();

    return !!wishlistItem;
  },
});

export const mergeWishlist = mutation({
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

    // Find guest wishlist
    const guestWishlist = await WishlistModel.findWishlist(ctx, null, args.sessionId);
    if (!guestWishlist) {
      return { success: true };
    }

    // Get or create user wishlist
    const userWishlist = await WishlistModel.getOrCreateWishlist(ctx, userId, null);
    if (!userWishlist) {
      throw new Error('Failed to create user wishlist');
    }

    // If they're the same, just update ownership
    if (guestWishlist._id === userWishlist._id) {
      await ctx.db.patch(guestWishlist._id, {
        userId,
        sessionId: undefined,
        updatedAt: Date.now(),
      });
      return { success: true };
    }

    // Merge the two wishlists
    await WishlistModel.mergeWishlists(ctx, guestWishlist._id, userWishlist._id);

    return { success: true };
  },
});
