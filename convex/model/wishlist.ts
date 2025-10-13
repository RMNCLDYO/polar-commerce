/**
 * Wishlist Model - Business logic for wishlist operations
 */

import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

/**
 * Get or create a wishlist for a user or session
 */
export async function getOrCreateWishlist(
  ctx: MutationCtx,
  userId?: string | null,
  sessionId?: string | null,
): Promise<Doc<'wishlists'> | null> {
  let wishlist: Doc<'wishlists'> | null = null;

  // Try to find existing wishlist
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

  // Create new wishlist if not found
  if (!wishlist) {
    const wishlistId = await ctx.db.insert('wishlists', {
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: sessionId ? Date.now() + 90 * 24 * 60 * 60 * 1000 : undefined, // 90 days for guest wishlists
    });
    wishlist = await ctx.db.get(wishlistId);
  }

  return wishlist;
}

/**
 * Find wishlist by user ID or session ID
 */
export async function findWishlist(
  ctx: QueryCtx,
  userId?: string | null,
  sessionId?: string | null,
): Promise<Doc<'wishlists'> | null> {
  if (userId) {
    return await ctx.db
      .query('wishlists')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    return await ctx.db
      .query('wishlists')
      .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
      .first();
  }
  return null;
}

/**
 * Add item to wishlist
 */
export async function addItemToWishlist(
  ctx: MutationCtx,
  wishlistId: Id<'wishlists'>,
  catalogId: Id<'catalog'>,
  notes?: string,
): Promise<void> {
  // Get product to verify it exists
  const product = await ctx.db.get(catalogId);
  if (!product || !product.isActive) {
    throw new Error('Product not found or inactive');
  }

  // Check if item already in wishlist
  const existingItem = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q) =>
      q.eq('wishlistId', wishlistId).eq('catalogId', catalogId),
    )
    .first();

  if (existingItem) {
    // Update notes if provided
    if (notes !== undefined) {
      await ctx.db.patch(existingItem._id, {
        notes,
      });
    }
  } else {
    // Add new item
    await ctx.db.insert('wishlistItems', {
      wishlistId,
      catalogId,
      addedAt: Date.now(),
      notes,
    });
  }

  // Update wishlist timestamp
  await ctx.db.patch(wishlistId, {
    updatedAt: Date.now(),
  });
}

/**
 * Remove item from wishlist
 */
export async function removeItemFromWishlist(
  ctx: MutationCtx,
  wishlistId: Id<'wishlists'>,
  catalogId: Id<'catalog'>,
): Promise<void> {
  const item = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q) =>
      q.eq('wishlistId', wishlistId).eq('catalogId', catalogId),
    )
    .first();

  if (item) {
    await ctx.db.delete(item._id);

    // Update wishlist timestamp
    await ctx.db.patch(wishlistId, {
      updatedAt: Date.now(),
    });
  }
}

/**
 * Get all items in a wishlist with product details
 */
export async function getWishlistItems(
  ctx: QueryCtx,
  wishlistId: Id<'wishlists'>,
) {
  const items = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q) => q.eq('wishlistId', wishlistId))
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

  return itemsWithProducts.filter(Boolean);
}

/**
 * Clear all items from wishlist
 */
export async function clearWishlistItems(
  ctx: MutationCtx,
  wishlistId: Id<'wishlists'>,
): Promise<void> {
  const items = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q) => q.eq('wishlistId', wishlistId))
    .collect();

  for (const item of items) {
    await ctx.db.delete(item._id);
  }

  await ctx.db.patch(wishlistId, {
    updatedAt: Date.now(),
  });
}

/**
 * Merge guest wishlist with user wishlist on login
 */
export async function mergeWishlists(
  ctx: MutationCtx,
  guestWishlistId: Id<'wishlists'>,
  userWishlistId: Id<'wishlists'>,
): Promise<void> {
  // Get items from guest wishlist
  const guestItems = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q) => q.eq('wishlistId', guestWishlistId))
    .collect();

  // Merge items into user wishlist
  for (const guestItem of guestItems) {
    const existingItem = await ctx.db
      .query('wishlistItems')
      .withIndex('wishlistId_catalogId', (q) =>
        q.eq('wishlistId', userWishlistId).eq('catalogId', guestItem.catalogId),
      )
      .first();

    if (!existingItem) {
      // Add item to user wishlist
      await ctx.db.insert('wishlistItems', {
        wishlistId: userWishlistId,
        catalogId: guestItem.catalogId,
        addedAt: guestItem.addedAt,
        notes: guestItem.notes,
      });
    }

    // Delete guest wishlist item
    await ctx.db.delete(guestItem._id);
  }

  // Delete guest wishlist
  await ctx.db.delete(guestWishlistId);

  // Update user wishlist timestamp
  await ctx.db.patch(userWishlistId, {
    updatedAt: Date.now(),
  });
}
