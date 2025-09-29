import Image from 'next/image';
import { Link } from '@/components/link';
import { getProducts, type ProductFilters } from '@/lib/products';

export const experimental_ppr = true;
export const revalidate = 3600;

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const searchParamsData = await searchParams;

  const filters: ProductFilters = {
    search: searchParamsData?.search as string | undefined,
    category: searchParamsData?.category as string | undefined,
    sort: searchParamsData?.sort as ProductFilters['sort'],
    minPrice: searchParamsData?.minPrice
      ? parseFloat(searchParamsData.minPrice as string)
      : undefined,
    maxPrice: searchParamsData?.maxPrice
      ? parseFloat(searchParamsData.maxPrice as string)
      : undefined,
  };

  const products = await getProducts(filters);

  return (
    <main className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            {searchParamsData?.search
              ? `Search results for "${searchParamsData.search}"`
              : searchParamsData?.category
                ? `${searchParamsData.category} Products`
                : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {products.length === 0
              ? 'No products found matching your criteria'
              : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}${
                  filters.sort
                    ? ` (sorted by ${filters.sort.replace('-', ' ')})`
                    : ''
                }`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetchStrategy="hover"
              className="group cursor-pointer"
            >
              <div className="relative aspect-square mb-4 overflow-hidden bg-muted/50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
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
                  <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 border border-border">
                    Quick Add
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: 'All Products - BANANA SPORTSWEAR',
  description:
    'Browse our complete collection of premium athletic gear and sportswear',
};
