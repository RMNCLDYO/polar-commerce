import { v } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import { type MutationCtx, mutation, query } from '../_generated/server';

async function getOrCreateWishlist(
  ctx: MutationCtx,
  userId?: string | null,
  sessionId?: string | null,
) {
  let wishlist: Doc<'wishlists'> | null = null;

  if (userId) {
    wishlist = await ctx.db
      .query('wishlists')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    wishlist = await ctx.db
      .query('wishlists')
      .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
      .first();
  }

  if (!wishlist) {
    const wishlistId = await ctx.db.insert('wishlists', {
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: sessionId ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    wishlist = await ctx.db.get(wishlistId);
  }

  return wishlist;
}

export const addToWishlist = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    const wishlist = await getOrCreateWishlist(ctx, userId, args.sessionId);
    if (!wishlist) {
      throw new Error('Failed to create wishlist');
    }

    const product = await ctx.db.get(args.catalogId);
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    const existingItem = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId_catalogId', (q) =>
        q.eq('wishlistId', wishlist._id).eq('catalogId', args.catalogId),
      )
      .first();

    if (existingItem) {
      throw new Error('Item already in wishlist');
    }

    await ctx.db.insert('wishlistItems', {
      wishlistId: wishlist._id,
      catalogId: args.catalogId,
      addedAt: Date.now(),
      notes: args.notes,
    });

    await ctx.db.patch(wishlist._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const removeFromWishlist = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
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
      throw new Error('Wishlist not found');
    }

    const wishlistItem = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId_catalogId', (q) =>
        q.eq('wishlistId', wishlist._id).eq('catalogId', args.catalogId),
      )
      .first();

    if (wishlistItem) {
      await ctx.db.delete(wishlistItem._id);

      await ctx.db.patch(wishlist._id, {
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const toggleWishlist = mutation({
  args: {
    catalogId: v.id('catalog'),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
    }

    const wishlist = await getOrCreateWishlist(ctx, userId, args.sessionId);
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
      await ctx.db.delete(existingItem._id);
      await ctx.db.patch(wishlist._id, {
        updatedAt: Date.now(),
      });
      return { success: true, action: 'removed' };
    } else {
      const product = await ctx.db.get(args.catalogId);
      if (!product || !product.isActive) {
        throw new Error('Product not found or inactive');
      }

      await ctx.db.insert('wishlistItems', {
        wishlistId: wishlist._id,
        catalogId: args.catalogId,
        addedAt: Date.now(),
      });

      await ctx.db.patch(wishlist._id, {
        updatedAt: Date.now(),
      });

      return { success: true, action: 'added' };
    }
  },
});

export const clearWishlist = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId && !args.sessionId) {
      throw new Error('User must be authenticated or provide a session ID');
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
      return { success: true };
    }

    const wishlistItems = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId', (q) => q.eq('wishlistId', wishlist._id))
      .collect();

    for (const item of wishlistItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.patch(wishlist._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getWishlist = query({
  args: {
    sessionId: v.optional(v.string()),
  },
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

    const validItems = itemsWithProducts.filter(Boolean);

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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new Error('User must be authenticated');
    }

    const guestWishlist = await ctx.db
      .query('wishlists')
      .withIndex('sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!guestWishlist) {
      return { success: true };
    }

    const userWishlist = await getOrCreateWishlist(ctx, userId, null);
    if (!userWishlist) {
      throw new Error('Failed to create user wishlist');
    }

    if (guestWishlist._id === userWishlist._id) {
      await ctx.db.patch(guestWishlist._id, {
        userId,
        sessionId: undefined,
        updatedAt: Date.now(),
      });
      return { success: true };
    }

    const guestItems = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId', (q) => q.eq('wishlistId', guestWishlist._id))
      .collect();

    for (const guestItem of guestItems) {
      const existingItem = await ctx.db
        .query('wishlistItems')
        .withIndex('wishlistId_catalogId', (q) =>
          q
            .eq('wishlistId', userWishlist._id)
            .eq('catalogId', guestItem.catalogId),
        )
        .first();

      if (!existingItem) {
        await ctx.db.insert('wishlistItems', {
          wishlistId: userWishlist._id,
          catalogId: guestItem.catalogId,
          addedAt: guestItem.addedAt,
          notes: guestItem.notes,
        });
      }

      await ctx.db.delete(guestItem._id);
    }

    await ctx.db.delete(guestWishlist._id);

    await ctx.db.patch(userWishlist._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
