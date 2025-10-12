import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import { Uploader } from '@/app/(public)/(shop)/components/uploader';
import { ProductGrid } from '@/components/products/product-grid';
import { getProducts, type ProductFilters } from '@/lib/server/data/products';

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
    <div
      className="animate-page-in"
      style={{ viewTransitionName: 'home-content' }}
    >
      <CachedProductContent />
      <Uploader />
    </div>
  );
}
