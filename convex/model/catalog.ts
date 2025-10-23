import type { Doc, Id } from '../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../_generated/server';

export async function getActiveProducts(
  ctx: QueryCtx,
  options: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    excludeSubscriptions?: boolean;
  } = {},
): Promise<Doc<'catalog'>[]> {
  let products = await ctx.db
    .query('catalog')
    .withIndex('isActive', (q) => q.eq('isActive', true))
    .collect();

  if (options.excludeSubscriptions) {
    products = products.filter((p) => p.category !== 'subscription');
  }

  if (options.category) {
    const categoryFilter = options.category.toUpperCase();
    products = products.filter((p) =>
      p.category.toUpperCase().includes(categoryFilter),
    );
  }

  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm),
    );
  }

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    products = products.filter((p) => {
      if (options.minPrice !== undefined && p.price < options.minPrice * 100)
        {return false;}
      if (options.maxPrice !== undefined && p.price > options.maxPrice * 100)
        {return false;}
      return true;
    });
  }

  return products;
}

export function sortProducts(
  products: Doc<'catalog'>[],
  sortOption?:
    | 'price-asc'
    | 'price-desc'
    | 'name-asc'
    | 'name-desc'
    | 'newest',
): Doc<'catalog'>[] {
  return products.sort((a, b) => {
    if (a.inStock !== b.inStock) {
      return a.inStock ? -1 : 1;
    }

    if (sortOption) {
      switch (sortOption) {
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
}

export function formatProduct(product: Doc<'catalog'>) {
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
}

export async function createProduct(
  ctx: MutationCtx,
  data: {
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    description: string;
    polarProductId?: string;
    polarImageUrl?: string;
    polarImageId?: string;
    inStock?: boolean;
    inventory_qty?: number;
  },
): Promise<Id<'catalog'>> {
  return await ctx.db.insert('catalog', {
    ...data,
    isActive: true,
    inStock: data.inStock ?? true,
    inventory_qty: data.inventory_qty ?? 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateInventory(
  ctx: MutationCtx,
  productId: Id<'catalog'>,
  quantityChange: number,
): Promise<{
  success: boolean;
  newInventory: number;
  inStock: boolean;
}> {
  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const newInventory = product.inventory_qty + quantityChange;

  await ctx.db.patch(productId, {
    inventory_qty: Math.max(0, newInventory),
    inStock: newInventory > 0,
    updatedAt: Date.now(),
  });

  return {
    success: true,
    newInventory: Math.max(0, newInventory),
    inStock: newInventory > 0,
  };
}

export async function linkProductToPolar(
  ctx: MutationCtx,
  productId: Id<'catalog'>,
  polarProductId: string,
): Promise<void> {
  await ctx.db.patch(productId, {
    polarProductId,
    updatedAt: Date.now(),
  });
}

export async function updateProduct(
  ctx: MutationCtx,
  productId: Id<'catalog'>,
  updates: Partial<Doc<'catalog'>>,
): Promise<void> {
  await ctx.db.patch(productId, {
    ...updates,
    updatedAt: Date.now(),
  });
}
