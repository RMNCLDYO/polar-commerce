import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { validateQuantity } from '../utils/validation';

export async function getOrCreateCart(
  ctx: MutationCtx,
  userId?: string | null,
  sessionId?: string | null,
): Promise<Doc<'carts'> | null> {
  let cart: Doc<'carts'> | null = null;

  if (userId) {
    cart = await ctx.db
      .query('carts')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    cart = await ctx.db
      .query('carts')
      .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
      .first();
  }

  if (!cart) {
    const cartId = await ctx.db.insert('carts', {
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: sessionId ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    cart = await ctx.db.get(cartId);
  }

  return cart;
}

export async function addItemToCart(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
  catalogId: Id<'catalog'>,
  quantity: number,
): Promise<void> {
  const product = await ctx.db.get(catalogId);
  if (!product || !product.isActive) {
    throw new Error('Product not found or inactive');
  }

  if (!product.inStock || product.inventory_qty <= 0) {
    throw new Error('Product is out of stock');
  }

  const existingItem = await ctx.db
    .query('cartItems')
    .withIndex('cartId_catalogId', (q) =>
      q.eq('cartId', cartId).eq('catalogId', catalogId),
    )
    .first();

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  validateQuantity(newQuantity, product.inventory_qty, product.name);

  if (existingItem) {
    await ctx.db.patch(existingItem._id, {
      quantity: newQuantity,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert('cartItems', {
      cartId,
      catalogId,
      quantity,
      price: product.price,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  await ctx.db.patch(cartId, {
    updatedAt: Date.now(),
  });
}

export async function findCart(
  ctx: QueryCtx,
  userId?: string | null,
  sessionId?: string | null,
): Promise<Doc<'carts'> | null> {
  if (userId) {
    return await ctx.db
      .query('carts')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
  } else if (sessionId) {
    return await ctx.db
      .query('carts')
      .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
      .first();
  }
  return null;
}

export async function getCartItems(
  ctx: QueryCtx,
  cartId: Id<'carts'>,
) {
  const items = await ctx.db
    .query('cartItems')
    .withIndex('cartId_catalogId', (q) => q.eq('cartId', cartId))
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

export function calculateCartTotals(
  items: Array<{
    quantity: number;
    price: number;
  }>,
): {
  subtotal: number;
  itemCount: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
    0,
  );

  const itemCount = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0,
  );

  return { subtotal, itemCount };
}

export async function removeItemFromCart(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
  catalogId: Id<'catalog'>,
): Promise<void> {
  const cartItem = await ctx.db
    .query('cartItems')
    .withIndex('cartId_catalogId', (q) =>
      q.eq('cartId', cartId).eq('catalogId', catalogId),
    )
    .first();

  if (cartItem) {
    await ctx.db.delete(cartItem._id);

    await ctx.db.patch(cartId, {
      updatedAt: Date.now(),
    });
  }
}

export async function clearCartItems(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
): Promise<void> {
  const items = await ctx.db
    .query('cartItems')
    .withIndex('cartId_catalogId', (q) => q.eq('cartId', cartId))
    .collect();

  for (const item of items) {
    await ctx.db.delete(item._id);
  }

  await ctx.db.patch(cartId, {
    updatedAt: Date.now(),
  });
}
