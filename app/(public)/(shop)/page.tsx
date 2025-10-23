import {
  cacheLife,
  cacheTag,
} from 'next/cache';
import { Uploader } from '@/app/(public)/(shop)/components/uploader';
import { ProductGrid } from '@/components/products/product-grid';
import { ViewTransition } from '@/components/view-transition';
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
    <ViewTransition name="home-content" className="animate-page-in">
      <CachedProductContent />
      <Uploader />
    </ViewTransition>
  );
}
