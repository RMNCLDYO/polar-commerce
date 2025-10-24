/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GenericQueryCtx, GenericDataModel } from 'convex/server';
import type { GenericId } from 'convex/values';
import { getAll } from 'convex-helpers/server/relationships';

export async function getDocuments<
  Ctx extends GenericQueryCtx<GenericDataModel>,
  TableName extends string,
>(
  ctx: Ctx,
  ids: Array<GenericId<TableName>>,
): Promise<Array<any>> {
  return await getAll(ctx.db, ids);
}

export async function getCartWithItems(
  ctx: any,
  cartId: any,
) {
  const cart = await ctx.db.get(cartId);
  if (!cart) {return null;}

  const cartItems = await ctx.db
    .query('cartItems')
    .withIndex('cartId_catalogId', (q: any) => q.eq('cartId', cartId))
    .collect();

  const productIds = cartItems.map((item: any) => item.catalogId);
  const products = await getAll(ctx.db, productIds);

  const productMap = new Map(products.map((p: any) => [p._id, p]));

  const itemsWithProducts = cartItems.map((item: any) => ({
    ...item,
    product: productMap.get(item.catalogId),
  })).filter((item: any) => item.product);

  return {
    cart,
    items: itemsWithProducts,
  };
}

export async function getWishlistWithItems(
  ctx: any,
  wishlistId: any,
) {
  const wishlist = await ctx.db.get(wishlistId);
  if (!wishlist) {return null;}

  const wishlistItems = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q: any) => q.eq('wishlistId', wishlistId))
    .collect();

  const productIds = wishlistItems.map((item: any) => item.catalogId);
  const products = await getAll(ctx.db, productIds);

  const productMap = new Map(products.map((p: any) => [p._id, p]));

  const itemsWithProducts = wishlistItems.map((item: any) => ({
    ...item,
    product: productMap.get(item.catalogId),
  })).filter((item: any) => item.product);

  return {
    wishlist,
    items: itemsWithProducts,
  };
}

export async function getUserOrdersWithProducts(
  ctx: any,
  userId: string,
) {
  const orders = await ctx.db
    .query('orders')
    .withIndex('userId', (q: any) => q.eq('userId', userId))
    .order('desc')
    .collect();

  return orders;
}

export async function getProductsByCategory(
  ctx: any,
  category: string,
) {
  return await ctx.db
    .query('catalog')
    .withIndex('category', (q: any) => q.eq('category', category))
    .collect();
}

export async function batchGetProducts(
  ctx: any,
  productIds: Array<any>,
) {
  return await getAll(ctx.db, productIds);
}

export async function getUserCarts(
  ctx: any,
  userId?: string,
  sessionId?: string,
) {
  const carts = [];

  if (userId) {
    const userCart = await ctx.db
      .query('carts')
      .withIndex('userId', (q: any) => q.eq('userId', userId))
      .first();
    if (userCart) {carts.push(userCart);}
  }

  if (sessionId) {
    const sessionCart = await ctx.db
      .query('carts')
      .withIndex('sessionId', (q: any) => q.eq('sessionId', sessionId))
      .first();
    if (sessionCart) {carts.push(sessionCart);}
  }

  return carts;
}

export async function getRelatedProducts(
  ctx: any,
  productId: any,
  limit: number = 4,
) {
  const product = await ctx.db.get(productId);
  if (!product) {return [];}

  const relatedProducts = await ctx.db
    .query('catalog')
    .withIndex('category', (q: any) => q.eq('category', product.category))
    .filter((q: any) => q.neq(q.field('_id'), productId))
    .filter((q: any) => q.eq(q.field('isActive'), true))
    .take(limit);

  return relatedProducts;
}

export async function isInCart(
  ctx: any,
  userId: string | undefined,
  sessionId: string | undefined,
  productId: any,
): Promise<boolean> {
  let cart = null;
  if (userId) {
    cart = await ctx.db
      .query('carts')
      .withIndex('userId', (q: any) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    cart = await ctx.db
      .query('carts')
      .withIndex('sessionId', (q: any) => q.eq('sessionId', sessionId))
      .first();
  }

  if (!cart) {return false;}

  const item = await ctx.db
    .query('cartItems')
    .withIndex('cartId_catalogId', (q: any) =>
      q.eq('cartId', cart._id).eq('catalogId', productId),
    )
    .first();

  return !!item;
}

export async function isInWishlist(
  ctx: any,
  userId: string | undefined,
  sessionId: string | undefined,
  productId: any,
): Promise<boolean> {
  let wishlist = null;
  if (userId) {
    wishlist = await ctx.db
      .query('wishlists')
      .withIndex('userId', (q: any) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    wishlist = await ctx.db
      .query('wishlists')
      .withIndex('sessionId', (q: any) => q.eq('sessionId', sessionId))
      .first();
  }

  if (!wishlist) {return false;}

  const item = await ctx.db
    .query('wishlistItems')
    .withIndex('wishlistId_catalogId', (q: any) =>
      q.eq('wishlistId', wishlist._id).eq('catalogId', productId),
    )
    .first();

  return !!item;
}
