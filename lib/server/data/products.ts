import 'server-only';

import { fetchQuery } from 'convex/nextjs';
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Product, ProductFilters } from '@/lib/shared/types';

export type { Product, ProductFilters };

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('products');

  const products = await fetchQuery(api.catalog.catalog.getProducts, {
    category: filters?.category,
    search: filters?.search,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    sort: filters?.sort,
    limit: filters?.limit,
    excludeSubscriptions: filters?.excludeSubscriptions,
  });

  return products;
}

export async function getProduct(id: string): Promise<Product | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('products', `product-${id}`);

  try {
    const product = await fetchQuery(api.catalog.catalog.getProduct, {
      id: id as Id<'catalog'>,
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
