import type { Metadata } from 'next';
import {
  cacheLife,
  cacheTag,
} from 'next/cache';
import Image from 'next/image';
import { QuickAddButton } from '@/components/cart/quick-add-button';
import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { AddToWishlistButton } from '@/components/wishlist/add-to-wishlist-button';
import type { Id } from '@/convex/_generated/dataModel';
import { getProducts, type ProductFilters } from '@/lib/server/data/products';
import { cn } from '@/lib/shared/utils';

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function CachedProductsContent({
  search,
  category,
  sort,
  minPrice,
  maxPrice,
}: {
  search?: string;
  category?: string;
  sort?: ProductFilters['sort'];
  minPrice?: number;
  maxPrice?: number;
}) {
  'use cache';
  cacheLife('hours');
  cacheTag('products');

  const filters: ProductFilters = {
    search,
    category,
    sort,
    minPrice,
    maxPrice,
    excludeSubscriptions: true,
  };

  const products = await getProducts(filters);

  return (
    <main
      className="px-8 py-12"
      style={{ viewTransitionName: 'products-content' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1
            className="text-3xl font-bold tracking-tight mb-4"
            style={{ viewTransitionName: 'page-title' }}
          >
            {search
              ? `Search results for "${search}"`
              : category
                ? `${category} Products`
                : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {products.length === 0
              ? 'No products found matching your criteria'
              : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}${sort ? ` (sorted by ${sort.replace('-', ' ')})` : ''
              }`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetchStrategy="hover"
              className="group cursor-pointer"
            >
              <div
                className="relative mb-4 overflow-hidden"
                style={{ aspectRatio: '3/4' }}
              >
                <div
                  className={cn(
                    'absolute inset-0 transition-all duration-300',
                    !product.inStock &&
                    'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100',
                  )}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    priority={index < 4}
                  />
                </div>

                {!product.inStock && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 font-bold z-10 text-[10px] px-2 py-0.5"
                  >
                    SOLD OUT
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-sm font-semibold tracking-wide line-clamp-1">
                  {product.name}
                </h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                  {product.category}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{product.price}</span>
                  <div className="flex items-center gap-2">
                    <AddToWishlistButton
                      catalogId={product.id as Id<'catalog'>}
                      variant="outline"
                      size="sm"
                      productInfo={{
                        name: product.name,
                        image:
                          typeof product.image === 'string'
                            ? product.image
                            : product.image.src,
                        price: product.price,
                      }}
                    />
                    <QuickAddButton
                      catalogId={product.id as Id<'catalog'>}
                      inStock={product.inStock}
                      productInfo={{
                        name: product.name,
                        image:
                          typeof product.image === 'string'
                            ? product.image
                            : product.image.src,
                        price: product.price,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const searchParamsData = await searchParams;

  return (
    <CachedProductsContent
      search={searchParamsData?.search as string | undefined}
      category={searchParamsData?.category as string | undefined}
      sort={searchParamsData?.sort as ProductFilters['sort']}
      minPrice={
        searchParamsData?.minPrice
          ? parseFloat(searchParamsData.minPrice as string)
          : undefined
      }
      maxPrice={
        searchParamsData?.maxPrice
          ? parseFloat(searchParamsData.maxPrice as string)
          : undefined
      }
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All Products - BANANA SPORTSWEAR',
    description:
      'Browse our complete collection of premium athletic gear and sportswear',
  };
}
