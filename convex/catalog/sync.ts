import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from '../_generated/server';
import { logger } from '../utils/logger';

// Local type definitions for Polar SDK price objects
interface PolarPriceInput {
  type: 'one_time';
  amountType: 'fixed';
  priceAmount: number;
  priceCurrency: 'usd';
}

/**
 * Create a product in catalog AND automatically sync to Polar
 * This is the ONLY way to create products - ensures 100% sync
 */
export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(), // in cents
    category: v.string(),
    imageUrl: v.string(),
    description: v.string(),
    isActive: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
    inventory_qty: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Insert into catalog
    const productId = await ctx.db.insert('catalog', {
      ...args,
      isActive: args.isActive ?? true,
      inStock: args.inStock ?? true,
      inventory_qty: args.inventory_qty ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 2. Trigger Polar sync action
    await ctx.scheduler.runAfter(0, internal.catalog.sync.syncProductToPolar, {
      productId,
    });

    return productId;
  },
});

/**
 * Update a product in catalog AND automatically sync to Polar
 */
export const updateProduct = mutation({
  args: {
    productId: v.id('catalog'),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
    inventory_qty: v.optional(v.number()),
  },
  handler: async (ctx, { productId, ...updates }) => {
    // 1. Update catalog
    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // 2. Trigger Polar sync
    await ctx.scheduler.runAfter(0, internal.catalog.sync.syncProductToPolar, {
      productId,
    });

    return productId;
  },
});

/**
 * Delete a product from catalog AND Polar
 */
export const deleteProduct = mutation({
  args: {
    productId: v.id('catalog'),
  },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId);
    if (!product) {throw new Error('Product not found');}

    // 1. Mark as inactive (soft delete)
    await ctx.db.patch(productId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // 2. Archive in Polar if it exists
    if (product.polarProductId) {
      await ctx.scheduler.runAfter(
        0,
        internal.catalog.sync.archivePolarProduct,
        {
          polarProductId: product.polarProductId,
        },
      );
    }

    return productId;
  },
});

/**
 * Internal action: Sync a product to Polar
 * Called automatically after create/update
 */
export const syncProductToPolar = internalAction({
  args: {
    productId: v.id('catalog'),
  },
  handler: async (ctx, { productId }) => {
    // Get product from catalog
    const product = await ctx.runQuery(internal.catalog.sync.getProduct, {
      productId,
    });

    if (!product) {
      logger.error(`Product ${productId} not found`);
      return;
    }

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      logger.error('POLAR_ORGANIZATION_TOKEN not set');
      return;
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    const priceInput: PolarPriceInput = {
      type: 'one_time',
      amountType: 'fixed',
      priceAmount: product.price,
      priceCurrency: 'usd',
    };

    try {
      if (product.polarProductId) {
        // Update existing Polar product
        logger.info(`Updating Polar product: ${product.name}`);

        await polarClient.products.update({
          id: product.polarProductId,
          productUpdate: {
            name: product.name,
            description: product.description,
            prices: [priceInput],
          },
        });
      } else {
        // Create new Polar product
        logger.info(`Creating Polar product: ${product.name}`);

        const result = await polarClient.products.create({
          name: product.name,
          description: product.description,
          prices: [priceInput],
        });

        if (result) {
          // Store Polar product ID in catalog
          await ctx.runMutation(internal.catalog.sync.updatePolarId, {
            productId,
            polarProductId: result.id,
          });
        }
      }

      logger.info(`Synced product to Polar: ${product.name}`);
    } catch (error: unknown) {
      logger.error(`Failed to sync product to Polar:`, error);
      // Don't throw - we don't want to block the mutation
    }
  },
});

/**
 * Internal action: Archive a product in Polar
 */
export const archivePolarProduct = internalAction({
  args: {
    polarProductId: v.string(),
  },
  handler: async (_ctx, { polarProductId }) => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      logger.error('POLAR_ORGANIZATION_TOKEN not set');
      return;
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      await polarClient.products.update({
        id: polarProductId,
        productUpdate: {
          isArchived: true,
        },
      });

      logger.info(`Archived Polar product: ${polarProductId}`);
    } catch (error: unknown) {
      logger.error(`Failed to archive Polar product:`, error);
    }
  },
});

/**
 * Internal query: Get product by ID
 */
export const getProduct = internalQuery({
  args: { productId: v.id('catalog') },
  handler: async (ctx, { productId }) => {
    return await ctx.db.get(productId);
  },
});

/**
 * Internal mutation: Update Polar product ID
 */
export const updatePolarId = internalMutation({
  args: {
    productId: v.id('catalog'),
    polarProductId: v.string(),
  },
  handler: async (ctx, { productId, polarProductId }) => {
    await ctx.db.patch(productId, {
      polarProductId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Helper: List all active products
 */
export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('catalog')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

/**
 * Helper: Get products by category
 */
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query('catalog')
      .withIndex('category', (q) => q.eq('category', category))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

/**
 * Cron job: Sync all products to Polar
 * Runs every hour to ensure everything stays in sync
 */
export const syncAllProductsToPolar = internalMutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query('catalog')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    logger.info(`[CRON] Syncing ${products.length} products to Polar...`);

    let synced = 0;
    for (const product of products) {
      try {
        await ctx.scheduler.runAfter(
          0,
          internal.catalog.sync.syncProductToPolar,
          {
            productId: product._id,
          },
        );
        synced++;
      } catch (error) {
        logger.error(`Failed to schedule sync for ${product.name}:`, error);
      }
    }

    logger.info(`[CRON] Scheduled ${synced}/${products.length} product syncs`);
  },
});
