/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GenericId } from 'convex/values';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { canRead, canWrite, canModify } from './rls';

export interface CRUDConfig<T extends string> {
  table: T;
  enableRLS?: boolean;
  enableSoftDelete?: boolean;
  softDeleteField?: string;
}

export function createCRUD<T extends string>(config: CRUDConfig<T>) {
  const {
    table,
    enableRLS = true,
    enableSoftDelete = false,
    softDeleteField = 'deletedAt',
  } = config;

  return {
    async create(ctx: MutationCtx, data: any): Promise<any> {
      if (enableRLS) {
        const canWriteDoc = await canWrite(ctx, table as any, data);
        if (!canWriteDoc) {
          throw new Error(`Permission denied: Cannot create ${table}`);
        }
      }

      const doc = {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return await ctx.db.insert(table as any, doc);
    },

    async read(ctx: QueryCtx, id: GenericId<T>): Promise<any | null> {
      const doc = await ctx.db.get(id as any);
      if (!doc) { return null; }

      if (enableSoftDelete && (doc as any)[softDeleteField]) {
        return null;
      }

      if (enableRLS) {
        const canReadDoc = await canRead(ctx, table as any, doc);
        if (!canReadDoc) {
          return null;
        }
      }

      return doc;
    },

    async list(
      ctx: QueryCtx,
      filter?: (q: any) => any,
      limit?: number,
    ): Promise<any[]> {
      let query = ctx.db.query(table as any);

      if (filter) {
        query = query.filter(filter);
      }

      if (enableSoftDelete) {
        query = query.filter((q: any) => q.eq(q.field(softDeleteField), undefined));
      }

      let docs = limit ? await query.take(limit) : await query.collect();

      if (enableRLS) {
        const filtered = [];
        for (const doc of docs) {
          if (await canRead(ctx, table as any, doc)) {
            filtered.push(doc);
          }
        }
        docs = filtered;
      }

      return docs;
    },

    async update(
      ctx: MutationCtx,
      id: GenericId<T>,
      updates: any,
    ): Promise<void> {
      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      if (enableSoftDelete && (doc as any)[softDeleteField]) {
        throw new Error(`${table} has been deleted`);
      }

      if (enableRLS) {
        const canModifyDoc = await canModify(ctx, table as any, doc);
        if (!canModifyDoc) {
          throw new Error(`Permission denied: Cannot update ${table}`);
        }
      }

      await ctx.db.patch(id as any, {
        ...updates,
        updatedAt: Date.now(),
      });
    },

    async delete(ctx: MutationCtx, id: GenericId<T>): Promise<void> {
      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      if (enableRLS) {
        const canModifyDoc = await canModify(ctx, table as any, doc);
        if (!canModifyDoc) {
          throw new Error(`Permission denied: Cannot delete ${table}`);
        }
      }

      if (enableSoftDelete) {
        await ctx.db.patch(id as any, {
          [softDeleteField]: Date.now(),
          updatedAt: Date.now(),
        } as any);
      } else {
        await ctx.db.delete(id as any);
      }
    },

    async permanentDelete(ctx: MutationCtx, id: GenericId<T>): Promise<void> {
      if (!enableSoftDelete) {
        throw new Error('Soft delete is not enabled for this table');
      }

      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      if (enableRLS) {
        const canModifyDoc = await canModify(ctx, table as any, doc);
        if (!canModifyDoc) {
          throw new Error(`Permission denied: Cannot permanently delete ${table}`);
        }
      }

      await ctx.db.delete(id as any);
    },

    async restore(ctx: MutationCtx, id: GenericId<T>): Promise<void> {
      if (!enableSoftDelete) {
        throw new Error('Soft delete is not enabled for this table');
      }

      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      if (!(doc as any)[softDeleteField]) {
        throw new Error(`${table} is not deleted`);
      }

      if (enableRLS) {
        const canModifyDoc = await canModify(ctx, table as any, doc);
        if (!canModifyDoc) {
          throw new Error(`Permission denied: Cannot restore ${table}`);
        }
      }

      await ctx.db.patch(id as any, {
        [softDeleteField]: undefined,
        updatedAt: Date.now(),
      } as any);
    },

    async count(ctx: QueryCtx, filter?: (q: any) => any): Promise<number> {
      const docs = await this.list(ctx, filter);
      return docs.length;
    },

    async exists(ctx: QueryCtx, id: GenericId<T>): Promise<boolean> {
      const doc = await this.read(ctx, id);
      return doc !== null;
    },
  };
}


export const catalogCRUD = createCRUD({
  table: 'catalog',
  enableRLS: false,
  enableSoftDelete: true,
});

export const cartItemCRUD = createCRUD({
  table: 'cartItems',
  enableRLS: true,
});

export const wishlistItemCRUD = createCRUD({
  table: 'wishlistItems',
  enableRLS: true,
});
