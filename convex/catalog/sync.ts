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

interface PolarPriceInput {
  type: 'one_time';
  amountType: 'fixed';
  priceAmount: number;
  priceCurrency: 'usd';
}

export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    description: v.string(),
    isActive: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
    inventory_qty: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    const productId = await ctx.db.insert('catalog', {
      ...args,
      isActive: args.isActive ?? true,
      inStock: args.inStock ?? true,
      inventory_qty: args.inventory_qty ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.catalog.sync.syncProductToPolar, {
      productId,
    });

    return productId;
  },
});

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
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.catalog.sync.syncProductToPolar, {
      productId,
    });

    return productId;
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id('catalog'),
  },
  handler: async (ctx, { productId }) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    const product = await ctx.db.get(productId);
    if (!product) { throw new Error('Product not found'); }

    await ctx.db.patch(productId, {
      isActive: false,
      updatedAt: Date.now(),
    });

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

export const syncProductToPolar = internalAction({
  args: {
    productId: v.id('catalog'),
  },
  handler: async (ctx, { productId }) => {
    const product = await ctx.runQuery(internal.catalog.sync.getProduct, {
      productId,
    });

    if (!product) {
      return;
    }

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
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

    if (product.polarProductId) {
      await polarClient.products.update({
        id: product.polarProductId,
        productUpdate: {
          name: product.name,
          description: product.description,
          prices: [priceInput],
        },
      });
    } else {
      const result = await polarClient.products.create({
        name: product.name,
        description: product.description,
        prices: [priceInput],
      });

      if (result) {
        await ctx.runMutation(internal.catalog.sync.updatePolarId, {
          productId,
          polarProductId: result.id,
        });
      }
    }
  },
});

export const archivePolarProduct = internalAction({
  args: {
    polarProductId: v.string(),
  },
  handler: async (_ctx, { polarProductId }) => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      return;
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    await polarClient.products.update({
      id: polarProductId,
      productUpdate: {
        isArchived: true,
      },
    });
  },
});

export const getProduct = internalQuery({
  args: { productId: v.id('catalog') },
  handler: async (ctx, { productId }) => {
    return await ctx.db.get(productId);
  },
});

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

export const listProducts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('catalog'),
      _creationTime: v.number(),
      name: v.string(),
      price: v.number(),
      category: v.string(),
      imageUrl: v.string(),
      polarImageUrl: v.optional(v.string()),
      polarImageId: v.optional(v.string()),
      description: v.string(),
      polarProductId: v.optional(v.string()),
      isActive: v.boolean(),
      inStock: v.boolean(),
      inventory_qty: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query('catalog')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect();
  },
});

export const listByCategory = internalQuery({
  args: { category: v.string() },
  returns: v.array(
    v.object({
      _id: v.id('catalog'),
      _creationTime: v.number(),
      name: v.string(),
      price: v.number(),
      category: v.string(),
      imageUrl: v.string(),
      polarImageUrl: v.optional(v.string()),
      polarImageId: v.optional(v.string()),
      description: v.string(),
      polarProductId: v.optional(v.string()),
      isActive: v.boolean(),
      inStock: v.boolean(),
      inventory_qty: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, { category }) => {
    const products = await ctx.db
      .query('catalog')
      .withIndex('category', (q) => q.eq('category', category))
      .collect();
    return products.filter(p => p.isActive);
  },
});

export const syncAllProductsToPolar = internalMutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query('catalog')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect();

    for (const product of products) {
      await ctx.scheduler.runAfter(
        0,
        internal.catalog.sync.syncProductToPolar,
        {
          productId: product._id,
        },
      );
    }
  },
});
