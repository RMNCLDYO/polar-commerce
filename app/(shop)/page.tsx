import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import { ProductGrid } from '@/components/product-grid';
import { Uploader } from '@/components/uploader';
import { getProducts, type ProductFilters } from '@/lib/products';

export const experimental_ppr = true;

async function CachedProductContent() {
  'use cache';
  cacheLife('hours');
  cacheTag('products');

  const filters: ProductFilters = {
    excludeSubscriptions: true,
    sort: 'newest',
    limit: 4,
  };

  const products = await getProducts(filters);

  return <ProductGrid products={products} />;
}

export default async function Page() {
  return (
    <div className="animate-page-in">
      <CachedProductContent />
      <Uploader />
    </div>
  );
}
