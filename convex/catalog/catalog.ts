import { v } from 'convex/values';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from '../_generated/server';
import { vProductListItem, vSuccessResponse } from '../utils/validation';

// Local type definitions for Polar SDK
interface PolarProduct {
  id: string;
  name: string;
  description?: string | null;
  isArchived?: boolean;
  is_archived?: boolean;
  [key: string]: unknown;
}

interface ProductsListResponse {
  result?: {
    items?: PolarProduct[];
  };
}

interface PageIteratorResponse {
  ok: boolean;
  value?: ProductsListResponse;
}

// Sync result type
interface SyncResult {
  convexId: Id<'catalog'>;
  name: string;
  status: 'already_linked' | 'found_existing' | 'created_new';
  polarProductId: string;
}

// Get all products with filters
export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sort: v.optional(
      v.union(
        v.literal('price-asc'),
        v.literal('price-desc'),
        v.literal('name-asc'),
        v.literal('name-desc'),
        v.literal('newest'),
      ),
    ),
    limit: v.optional(v.number()),
    excludeSubscriptions: v.optional(v.boolean()),
  },
  returns: v.array(vProductListItem),
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query('catalog')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect();

    // Exclude subscriptions if requested
    if (args.excludeSubscriptions) {
      products = products.filter((p) => p.category !== 'subscription');
    }

    // Category filter
    if (args.category) {
      const categoryFilter = args.category.toUpperCase();
      products = products.filter((p) =>
        p.category.toUpperCase().includes(categoryFilter),
      );
    }

    // Search filter
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm),
      );
    }

    // Price range filter
    if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      products = products.filter((p) => {
        if (args.minPrice !== undefined && p.price < args.minPrice * 100)
          {return false;}
        if (args.maxPrice !== undefined && p.price > args.maxPrice * 100)
          {return false;}
        return true;
      });
    }

    // Sorting - always put out of stock items at the end
    products.sort((a, b) => {
      // First sort by stock status (in stock first)
      if (a.inStock !== b.inStock) {
        return a.inStock ? -1 : 1;
      }

      // Then apply the user's chosen sort option
      if (args.sort) {
        switch (args.sort) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'newest':
            return b.createdAt - a.createdAt;
          default:
            return 0;
        }
      }
      return 0;
    });

    // Apply limit if specified
    if (args.limit !== undefined) {
      products = products.slice(0, args.limit);
    }

    // Transform to match the expected format
    return products.map((p) => ({
      id: p._id,
      name: p.name,
      price: `$${(p.price / 100).toFixed(0)}`,
      category: p.category,
      image: p.polarImageUrl || p.imageUrl,
      description: p.description,
      polarProductId: p.polarProductId,
      inStock: p.inStock,
      inventory_qty: p.inventory_qty,
    }));
  },
});

// Get single product by ID
export const getProduct = query({
  args: { id: v.id('catalog') },
  returns: v.union(vProductListItem, v.null()),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || !product.isActive) {
      return null;
    }

    return {
      id: product._id,
      name: product.name,
      price: `$${(product.price / 100).toFixed(0)}`,
      category: product.category,
      image: product.polarImageUrl || product.imageUrl,
      description: product.description,
      polarProductId: product.polarProductId,
      inStock: product.inStock,
      inventory_qty: product.inventory_qty,
    };
  },
});

// Create a new product
export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(), // in cents
    category: v.string(),
    imageUrl: v.string(),
    description: v.string(),
    polarProductId: v.optional(v.string()),
    polarImageUrl: v.optional(v.string()),
    polarImageId: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    inventory_qty: v.optional(v.number()),
  },
  returns: v.id('catalog'),
  handler: async (ctx, args) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    const productId = await ctx.db.insert('catalog', {
      ...args,
      isActive: true,
      inStock: args.inStock ?? true,
      inventory_qty: args.inventory_qty ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return productId;
  },
});

// Update product with Polar product ID
export const linkPolarProduct = mutation({
  args: {
    productId: v.id('catalog'),
    polarProductId: v.string(),
  },
  handler: async (ctx, args) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    await ctx.db.patch(args.productId, {
      polarProductId: args.polarProductId,
      updatedAt: Date.now(),
    });
  },
});

// Internal query to get all products (for syncing)
export const getAllProducts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('catalog').collect();
  },
});

// Public query to get all raw products (for scripts)
export const getAllProductsRaw = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('catalog').collect();
  },
});

// Simple list query (alias for getAllProductsRaw)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('catalog').collect();
  },
});

// Sync all Convex products to Polar and link them
export const syncProductsToPolar = action({
  args: {},
  handler: async (ctx): Promise<SyncResult[]> => {
    const { Polar } = await import('@polar-sh/sdk');

    const polarClient = new Polar({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN as string,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    // Get all Convex products
    const convexProducts = await ctx.runQuery(
      internal.catalog.catalog.getAllProducts,
    );

    // Get all Polar products - Polar API returns paginated response
    const polarProductsIter = await polarClient.products.list({ limit: 100 });
    const polarProducts: PolarProduct[] = [];
    for await (const response of polarProductsIter) {
      // Polar SDK returns IteratorResult with nested response structure
      const resp = response as unknown as PageIteratorResponse;
      if (resp.ok && resp.value) {
        const data = resp.value;
        const items = data.result?.items || [];
        polarProducts.push(...items);
      }
    }

    const results: SyncResult[] = [];

    for (const convexProduct of convexProducts) {
      // Check if product already linked
      if (convexProduct.polarProductId) {
        results.push({
          convexId: convexProduct._id,
          name: convexProduct.name,
          status: 'already_linked',
          polarProductId: convexProduct.polarProductId,
        });
        continue;
      }

      // Check if product exists in Polar by name
      const existingPolarProduct = polarProducts.find(
        (p) => p.name === convexProduct.name,
      );

      let polarProductId: string;

      if (existingPolarProduct) {
        polarProductId = existingPolarProduct.id;
        results.push({
          convexId: convexProduct._id,
          name: convexProduct.name,
          status: 'found_existing',
          polarProductId,
        });
      } else {
        // Create new product in Polar with fixed pricing
        // Note: organizationId is omitted when using organization token
        const newPolarProduct = await polarClient.products.create({
          name: convexProduct.name,
          description: convexProduct.description,
          prices: [
            {
              amountType: 'fixed',
              priceAmount: convexProduct.price,
              priceCurrency: 'usd',
            },
          ],
        });

        polarProductId = newPolarProduct.id;
        results.push({
          convexId: convexProduct._id,
          name: convexProduct.name,
          status: 'created_new',
          polarProductId,
        });
      }

      // Link the products
      await ctx.runMutation(internal.catalog.catalog.linkProductInternal, {
        productId: convexProduct._id,
        polarProductId,
      });
    }

    return results;
  },
});

// Internal mutation to link products
export const linkProductInternal = internalMutation({
  args: {
    productId: v.id('catalog'),
    polarProductId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, {
      polarProductId: args.polarProductId,
      updatedAt: Date.now(),
    });
  },
});

// Update product with partial data
export const updateProduct = mutation({
  args: {
    productId: v.id('catalog'),
    updates: v.object({
      name: v.optional(v.string()),
      price: v.optional(v.number()),
      category: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      polarImageUrl: v.optional(v.string()),
      polarImageId: v.optional(v.string()),
      description: v.optional(v.string()),
      polarProductId: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      inStock: v.optional(v.boolean()),
      inventory_qty: v.optional(v.number()),
    }),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { productId, updates } = args;

    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Public mutation to update Polar product ID (for external scripts)
export const updatePolarProductId = mutation({
  args: {
    productId: v.id('catalog'),
    polarProductId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const updateData: {
      updatedAt: number;
      polarProductId?: string;
    } = {
      updatedAt: Date.now(),
    };

    if (args.polarProductId === null || args.polarProductId === '') {
      updateData.polarProductId = undefined;
    } else {
      updateData.polarProductId = args.polarProductId;
    }

    await ctx.db.patch(args.productId, updateData);
  },
});

// Delete a product (for testing/cleanup)
export const deleteProduct = mutation({
  args: {
    productId: v.id('catalog'),
  },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    await ctx.db.delete(args.productId);
    return { success: true };
  },
});

// Update product image URL with Polar S3 URL
export const updateProductImageUrl = mutation({
  args: {
    productId: v.id('catalog'),
    imageUrl: v.string(),
    polarImageUrl: v.optional(v.string()),
    polarImageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { isAdmin } = await import('../auth/auth');
    if (!(await isAdmin(ctx))) {
      throw new Error('Unauthorized: Admin access required');
    }

    await ctx.db.patch(args.productId, {
      imageUrl: args.imageUrl,
      polarImageUrl: args.polarImageUrl || args.imageUrl,
      polarImageId: args.polarImageId,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation for decrementing inventory (called from checkout)
export const decrementInventoryInternal = internalMutation({
  args: {
    productId: v.id('catalog'),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newInventory = product.inventory_qty - args.quantity;

    await ctx.db.patch(args.productId, {
      inventory_qty: Math.max(0, newInventory),
      inStock: newInventory > 0,
      updatedAt: Date.now(),
    });

    // Audit log: Inventory decremented
    await ctx.runMutation(internal.lib.audit.logEvent, {
      eventType: 'inventory.decremented',
      resourceType: 'product',
      resourceId: args.productId,
      action: `Decremented inventory by ${args.quantity}`,
      details: {
        productName: product.name,
        quantity: args.quantity,
        oldInventory: product.inventory_qty,
        newInventory: Math.max(0, newInventory),
      },
      success: true,
    });

    return {
      success: true,
      newInventory: Math.max(0, newInventory),
      inStock: newInventory > 0,
    };
  },
});
