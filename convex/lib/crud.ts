/**
 * CRUD Utilities with Row-Level Security
 *
 * Generic CRUD operations that automatically apply RLS rules.
 * Based on convex-helpers CRUD patterns.
 */

import type { GenericDataModel } from 'convex/server';
import { v, Validator } from 'convex/values';
import type { GenericId } from 'convex/values';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { canRead, canWrite, canModify } from './rls';

/**
 * CRUD configuration for a table
 */
export interface CRUDConfig<T extends string> {
  table: T;
  enableRLS?: boolean; // Default: true
  enableSoftDelete?: boolean; // Default: false
  softDeleteField?: string; // Default: 'deletedAt'
}

/**
 * Generate CRUD operations for a table
 *
 * Usage:
 *   const todoCRUD = createCRUD({ table: 'demoTodos' });
 *
 *   export const createTodo = mutation({
 *     args: { text: v.string() },
 *     handler: async (ctx, args) => {
 *       return await todoCRUD.create(ctx, args);
 *     }
 *   });
 */
export function createCRUD<T extends string>(config: CRUDConfig<T>) {
  const {
    table,
    enableRLS = true,
    enableSoftDelete = false,
    softDeleteField = 'deletedAt',
  } = config;

  return {
    /**
     * Create a new document
     */
    async create(ctx: MutationCtx, data: any): Promise<any> {
      // Check write permission
      if (enableRLS) {
        const canWriteDoc = await canWrite(ctx, table as any, data);
        if (!canWriteDoc) {
          throw new Error(`Permission denied: Cannot create ${table}`);
        }
      }

      // Add timestamps
      const doc = {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return await ctx.db.insert(table as any, doc);
    },

    /**
     * Read a document by ID
     */
    async read(ctx: QueryCtx, id: GenericId<T>): Promise<any | null> {
      const doc = await ctx.db.get(id as any);
      if (!doc) {return null;}

      // Check soft delete
      if (enableSoftDelete && (doc as any)[softDeleteField]) {
        return null;
      }

      // Check read permission
      if (enableRLS) {
        const canReadDoc = await canRead(ctx, table as any, doc);
        if (!canReadDoc) {
          return null;
        }
      }

      return doc;
    },

    /**
     * List all documents (with optional filtering)
     */
    async list(
      ctx: QueryCtx,
      filter?: (q: any) => any,
      limit?: number,
    ): Promise<any[]> {
      let query = ctx.db.query(table as any);

      if (filter) {
        query = query.filter(filter);
      }

      // Filter out soft-deleted
      if (enableSoftDelete) {
        query = query.filter((q: any) => q.eq(q.field(softDeleteField), undefined));
      }

      let docs = limit ? await query.take(limit) : await query.collect();

      // Apply RLS filtering
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

    /**
     * Update a document
     */
    async update(
      ctx: MutationCtx,
      id: GenericId<T>,
      updates: any,
    ): Promise<void> {
      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      // Check soft delete
      if (enableSoftDelete && (doc as any)[softDeleteField]) {
        throw new Error(`${table} has been deleted`);
      }

      // Check modify permission
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

    /**
     * Delete a document
     */
    async delete(ctx: MutationCtx, id: GenericId<T>): Promise<void> {
      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      // Check modify permission
      if (enableRLS) {
        const canModifyDoc = await canModify(ctx, table as any, doc);
        if (!canModifyDoc) {
          throw new Error(`Permission denied: Cannot delete ${table}`);
        }
      }

      if (enableSoftDelete) {
        // Soft delete
        await ctx.db.patch(id as any, {
          [softDeleteField]: Date.now(),
          updatedAt: Date.now(),
        } as any);
      } else {
        // Hard delete
        await ctx.db.delete(id as any);
      }
    },

    /**
     * Permanently delete a soft-deleted document
     */
    async permanentDelete(ctx: MutationCtx, id: GenericId<T>): Promise<void> {
      if (!enableSoftDelete) {
        throw new Error('Soft delete is not enabled for this table');
      }

      const doc = await ctx.db.get(id as any);
      if (!doc) {
        throw new Error(`${table} not found`);
      }

      // Check modify permission
      if (enableRLS) {
        const canModifyDoc = await canModify(ctx, table as any, doc);
        if (!canModifyDoc) {
          throw new Error(`Permission denied: Cannot permanently delete ${table}`);
        }
      }

      await ctx.db.delete(id as any);
    },

    /**
     * Restore a soft-deleted document
     */
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

      // Check modify permission
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

    /**
     * Count documents
     */
    async count(ctx: QueryCtx, filter?: (q: any) => any): Promise<number> {
      const docs = await this.list(ctx, filter);
      return docs.length;
    },

    /**
     * Check if document exists
     */
    async exists(ctx: QueryCtx, id: GenericId<T>): Promise<boolean> {
      const doc = await this.read(ctx, id);
      return doc !== null;
    },
  };
}

/**
 * Example CRUD instances for common tables
 */

// Demo Todos CRUD
export const todoCRUD = createCRUD({
  table: 'demoTodos',
  enableRLS: true,
});

// Catalog CRUD (admin only)
export const catalogCRUD = createCRUD({
  table: 'catalog',
  enableRLS: false, // Public read, admin write
  enableSoftDelete: true, // Soft delete to preserve order history
});

// Cart Items CRUD
export const cartItemCRUD = createCRUD({
  table: 'cartItems',
  enableRLS: true,
});

// Wishlist Items CRUD
export const wishlistItemCRUD = createCRUD({
  table: 'wishlistItems',
  enableRLS: true,
});
