'use server';

import { revalidateTag } from 'next/cache';

/**
 * Cache invalidation utilities for the application.
 * Use these server actions to invalidate cached data when it changes.
 */

/**
 * Invalidate all product-related caches.
 * Use when products are added, updated, or deleted.
 */
export async function revalidateProducts() {
  revalidateTag('products', 'max');
}

/**
 * Invalidate a specific product cache.
 * Use when a single product is updated.
 */
export async function revalidateProduct(productId: string) {
  revalidateTag(`product-${productId}`, 'max');
}

/**
 * Invalidate all catalog/listing caches.
 * Use when the product catalog structure changes.
 */
export async function revalidateCatalog() {
  revalidateTag('catalog', 'max');
}

/**
 * Invalidate a specific category cache.
 * Use when products in a category change.
 */
export async function revalidateCategory(category: string) {
  revalidateTag(`category-${category}`, 'max');
}

/**
 * Invalidate all product and catalog caches.
 * Use for major catalog updates (bulk imports, etc).
 */
export async function revalidateAllProductData() {
  revalidateTag('products', 'max');
  revalidateTag('catalog', 'max');
}

/**
 * Invalidate inventory data.
 * Use when stock levels change.
 */
export async function revalidateInventory(productId?: string) {
  if (productId) {
    revalidateTag(`inventory-${productId}`, 'max');
  } else {
    revalidateTag('inventory', 'max');
  }
}

/**
 * Invalidate pricing data.
 * Use when prices change.
 */
export async function revalidatePricing(productId?: string) {
  if (productId) {
    revalidateTag(`price-${productId}`, 'max');
  } else {
    revalidateTag('pricing', 'max');
  }
}
