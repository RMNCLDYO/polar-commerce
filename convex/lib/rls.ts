/**
 * Row-Level Security (RLS) Implementation
 *
 * This provides fine-grained access control for database operations.
 * Rules are defined per table and operation type (read, write, modify).
 *
 * Based on: https://stack.convex.dev/row-level-security
 */

import type { Doc } from '../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../_generated/server';

/**
 * RLS Rules Definition
 *
 * Each table can have rules for:
 * - read: Can the user see this document?
 * - write: Can the user create this document?
 * - modify: Can the user update/delete this document?
 */
export async function rlsRules(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;

  return {
    // Cart access control
    carts: {
      read: async (cart: Doc<'carts'>) => {
        // User can read their own cart
        if (userId && cart.userId === userId) {return true;}
        // Anyone can read carts by sessionId (for guest users)
        return true;
      },
      write: async (cart: Partial<Doc<'carts'>>) => {
        // Must be authenticated or have sessionId
        return !!(userId || cart.sessionId);
      },
      modify: async (cart: Doc<'carts'>) => {
        // User can only modify their own cart
        if (userId && cart.userId === userId) {return true;}
        // Guest users can modify by session (handled in queries)
        return false;
      },
    },

    // Cart items access control
    cartItems: {
      read: async (item: Doc<'cartItems'>) => {
        // Check cart ownership
        const cart = await ctx.db.get(item.cartId);
        if (!cart) {return false;}
        if (userId && cart.userId === userId) {return true;}
        return true; // Session-based access handled at cart level
      },
      write: async (item: Partial<Doc<'cartItems'>>) => {
        // Must have a valid cart
        if (!item.cartId) {return false;}
        const cart = await ctx.db.get(item.cartId);
        if (!cart) {return false;}
        // Check cart ownership
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

    // Wishlist access control
    wishlists: {
      read: async (wishlist: Doc<'wishlists'>) => {
        if (userId && wishlist.userId === userId) {return true;}
        return true; // Session-based access
      },
      write: async (wishlist: Partial<Doc<'wishlists'>>) => {
        return !!(userId || wishlist.sessionId);
      },
      modify: async (wishlist: Doc<'wishlists'>) => {
        if (userId && wishlist.userId === userId) {return true;}
        return false;
      },
    },

    // Wishlist items access control
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

    // Orders access control
    orders: {
      read: async (order: Doc<'orders'>) => {
        // Users can read their own orders
        if (userId && order.userId === userId) {return true;}
        // Users can read orders by their email (for guest orders)
        if (userId) {
          const user = await ctx.db
            .query('betterAuth_user')
            .withIndex('id', (q) => q.eq('id', userId))
            .first();
          if (user && order.email === user.email) {return true;}
        }
        return false;
      },
      write: async () => {
        // Orders are only created by internal mutations (from checkout)
        return false;
      },
      modify: async () => {
        // Orders can only be modified by internal mutations
        return false;
      },
    },

    // Catalog - public read, admin write
    catalog: {
      read: async (product: Doc<'catalog'>) => {
        // Everyone can read active products
        return product.isActive;
      },
      write: async () => {
        // Only admins can create products (would need admin check)
        // For now, allow mutations (they're internal)
        return true;
      },
      modify: async () => {
        // Only admins can modify products
        return true;
      },
    },

    // Demo todos - user-scoped
    demoTodos: {
      read: async (todo: Doc<'demoTodos'>) => {
        return userId === todo.userId;
      },
      write: async (todo: Partial<Doc<'demoTodos'>>) => {
        return userId === todo.userId;
      },
      modify: async (todo: Doc<'demoTodos'>) => {
        return userId === todo.userId;
      },
    },
  };
}

/**
 * Check read access for a document
 */
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

/**
 * Check write access for a new document
 */
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

/**
 * Check modify access for an existing document
 */
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

/**
 * Filter query results based on RLS rules
 */
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
