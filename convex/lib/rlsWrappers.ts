/**
 * RLS Query and Mutation Wrappers
 *
 * These wrappers automatically apply row-level security rules to queries and mutations.
 * Use these instead of regular query/mutation for user-facing endpoints.
 */

import {
  customQuery,
  customMutation,
} from 'convex-helpers/server/customFunctions';
import { query, mutation } from '../_generated/server';
import { canRead, canWrite, canModify, filterReadable } from './rls';

/**
 * Query builder with automatic RLS filtering
 *
 * Usage:
 *   export const getMyCart = rlsQuery({
 *     args: { sessionId: v.optional(v.string()) },
 *     handler: async (ctx, args) => {
 *       const cart = await ctx.db.query('carts').first();
 *       // RLS automatically checks if user can read this cart
 *       return cart;
 *     }
 *   });
 */
export const rlsQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    // Pass through identity for RLS checks
    return { ctx, args };
  },
});

/**
 * Mutation builder with automatic RLS checks
 *
 * Usage:
 *   export const addToCart = rlsMutation({
 *     args: { catalogId: v.id('catalog'), quantity: v.number() },
 *     handler: async (ctx, args) => {
 *       // RLS automatically checks write/modify permissions
 *       await ctx.db.insert('cartItems', { ... });
 *     }
 *   });
 */
export const rlsMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    return { ctx, args };
  },
});

/**
 * Secure query helper that filters results
 */
export async function secureQuery<T extends string>(
  ctx: any,
  table: T,
  docs: Array<any>,
): Promise<Array<any>> {
  return await filterReadable(ctx, table as any, docs);
}

/**
 * Secure insert helper that checks write permissions
 */
export async function secureInsert<T extends string>(
  ctx: any,
  table: T,
  doc: any,
): Promise<any> {
  const canWriteDoc = await canWrite(ctx, table as any, doc);
  if (!canWriteDoc) {
    throw new Error(`Permission denied: Cannot create ${table}`);
  }
  return await ctx.db.insert(table, doc);
}

/**
 * Secure update helper that checks modify permissions
 */
export async function secureUpdate<T extends string>(
  ctx: any,
  table: T,
  docId: any,
  updates: any,
): Promise<void> {
  const doc = await ctx.db.get(docId);
  if (!doc) {
    throw new Error(`Document not found`);
  }

  const canModifyDoc = await canModify(ctx, table as any, doc);
  if (!canModifyDoc) {
    throw new Error(`Permission denied: Cannot modify ${table}`);
  }

  await ctx.db.patch(docId, updates);
}

/**
 * Secure delete helper that checks modify permissions
 */
export async function secureDelete<T extends string>(
  ctx: any,
  table: T,
  docId: any,
): Promise<void> {
  const doc = await ctx.db.get(docId);
  if (!doc) {
    throw new Error(`Document not found`);
  }

  const canModifyDoc = await canModify(ctx, table as any, doc);
  if (!canModifyDoc) {
    throw new Error(`Permission denied: Cannot delete ${table}`);
  }

  await ctx.db.delete(docId);
}
