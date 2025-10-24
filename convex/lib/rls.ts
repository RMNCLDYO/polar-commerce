/* eslint-disable @typescript-eslint/no-explicit-any */
import { authComponent } from '../auth/auth';
import type { Doc } from '../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../_generated/server';

export async function rlsRules(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;

  return {
    carts: {
      read: async (cart: Doc<'carts'>) => {
        if (userId && cart.userId === userId) {return true;}
        return true;
      },
      write: async (cart: Partial<Doc<'carts'>>) => {
        return !!(userId || cart.sessionId);
      },
      modify: async (cart: Doc<'carts'>) => {
        if (userId && cart.userId === userId) {return true;}
        return false;
      },
    },

    cartItems: {
      read: async (item: Doc<'cartItems'>) => {
        const cart = await ctx.db.get(item.cartId);
        if (!cart) {return false;}
        if (userId && cart.userId === userId) {return true;}
        return true;
      },
      write: async (item: Partial<Doc<'cartItems'>>) => {
        if (!item.cartId) {return false;}
        const cart = await ctx.db.get(item.cartId);
        if (!cart) {return false;}
        if (userId && cart.userId === userId) {return true;}
        return !!cart.sessionId;
      },
      modify: async (item: Doc<'cartItems'>) => {
        const cart = await ctx.db.get(item.cartId);
        if (!cart) {return false;}
        if (userId && cart.userId === userId) {return true;}
        return false;
      },
    },

    wishlists: {
      read: async (wishlist: Doc<'wishlists'>) => {
        if (userId && wishlist.userId === userId) {return true;}
        return true;
      },
      write: async (wishlist: Partial<Doc<'wishlists'>>) => {
        return !!(userId || wishlist.sessionId);
      },
      modify: async (wishlist: Doc<'wishlists'>) => {
        if (userId && wishlist.userId === userId) {return true;}
        return false;
      },
    },

    wishlistItems: {
      read: async (item: Doc<'wishlistItems'>) => {
        const wishlist = await ctx.db.get(item.wishlistId);
        if (!wishlist) {return false;}
        if (userId && wishlist.userId === userId) {return true;}
        return true;
      },
      write: async (item: Partial<Doc<'wishlistItems'>>) => {
        if (!item.wishlistId) {return false;}
        const wishlist = await ctx.db.get(item.wishlistId);
        if (!wishlist) {return false;}
        if (userId && wishlist.userId === userId) {return true;}
        return !!wishlist.sessionId;
      },
      modify: async (item: Doc<'wishlistItems'>) => {
        const wishlist = await ctx.db.get(item.wishlistId);
        if (!wishlist) {return false;}
        if (userId && wishlist.userId === userId) {return true;}
        return false;
      },
    },

    orders: {
      read: async (order: Doc<'orders'>) => {
        if (userId && order.userId === userId) {return true;}
        if (userId) {
          const user = await authComponent.getAnyUserById(ctx, userId);
          if (user && order.email === user.email) {return true;}
        }
        return false;
      },
      write: async () => {
        return false;
      },
      modify: async () => {
        return false;
      },
    },

    catalog: {
      read: async (product: Doc<'catalog'>) => {
        return product.isActive;
      },
      write: async () => {
        return true;
      },
      modify: async () => {
        return true;
      },
    },
  };
}

export async function canRead(
  ctx: QueryCtx,
  table: string,
  doc: any,
): Promise<boolean> {
  const rules = await rlsRules(ctx);
  const tableRules = (rules as any)[table];
  if (!tableRules || !tableRules.read) {return true;}
  return await tableRules.read(doc);
}

export async function canWrite(
  ctx: MutationCtx,
  table: string,
  doc: any,
): Promise<boolean> {
  const rules = await rlsRules(ctx);
  const tableRules = (rules as any)[table];
  if (!tableRules || !tableRules.write) {return true;}
  return await tableRules.write(doc);
}

export async function canModify(
  ctx: MutationCtx,
  table: string,
  doc: any,
): Promise<boolean> {
  const rules = await rlsRules(ctx);
  const tableRules = (rules as any)[table];
  if (!tableRules || !tableRules.modify) {return true;}
  return await tableRules.modify(doc);
}

export async function filterReadable(
  ctx: QueryCtx,
  table: string,
  docs: any[],
): Promise<any[]> {
  const filtered: any[] = [];

  for (const doc of docs) {
    if (await canRead(ctx, table, doc)) {
      filtered.push(doc);
    }
  }

  return filtered;
}
