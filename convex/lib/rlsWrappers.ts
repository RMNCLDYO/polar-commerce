/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  customQuery,
  customMutation,
} from 'convex-helpers/server/customFunctions';
import { query, mutation } from '../_generated/server';
import { canWrite, canModify, filterReadable } from './rls';

export const rlsQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    return { ctx, args };
  },
});

export const rlsMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    return { ctx, args };
  },
});

export async function secureQuery<T extends string>(
  ctx: any,
  table: T,
  docs: Array<any>,
): Promise<Array<any>> {
  return await filterReadable(ctx, table as any, docs);
}

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
