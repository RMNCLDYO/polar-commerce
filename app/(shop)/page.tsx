import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import { ProductGrid } from '@/components/product-grid';
import { Uploader } from '@/components/uploader';
import { getProducts, type ProductFilters } from '@/lib/products';

export const experimental_ppr = true;

async function CachedProductContent({
  search,
  category,
  sort,
}: {
  search?: string;
  category?: string;
  sort?: ProductFilters['sort'];
}) {
  'use cache';
  cacheLife('hours');
  cacheTag('products');

  const filters: ProductFilters = {
    search,
    category,
    sort,
  };

  const products = await getProducts(filters);

  return <ProductGrid products={products} />;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="animate-page-in">
      <CachedProductContent
        search={params?.search as string | undefined}
        category={params?.category as string | undefined}
        sort={params?.sort as ProductFilters['sort']}
      />
      <Uploader />
    </div>
  );
}
