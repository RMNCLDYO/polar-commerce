import { Suspense } from "react";
import { StorefrontLayout } from "@/components/storefront-layout";
import { getProducts, type ProductFilters } from "@/lib/products";

async function ProductsSection({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters: ProductFilters = {
    search: params?.search as string | undefined,
    category: params?.category as string | undefined,
    sort: params?.sort as ProductFilters["sort"],
  };

  const products = await getProducts(filters);

  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <StorefrontLayout products={products} />
    </Suspense>
  );
}

function ProductGridSkeleton() {
  return (
    <section className="px-8 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 flex items-center justify-between">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <ProductsSection searchParams={searchParams} />
    </Suspense>
  );
}

function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 py-6 border-b border-border">
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
