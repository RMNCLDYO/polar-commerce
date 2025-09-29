import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, type ProductFilters } from "@/lib/products";

export default async function NewPage(props: PageProps<'/new'>) {
  const searchParams = await props.searchParams;

  // For new arrivals, we'll just sort by name desc (simulating newest first)
  // In a real app, you'd have a createdAt date field
  const filters: ProductFilters = {
    search: searchParams?.search as string | undefined,
    sort: searchParams?.sort as ProductFilters['sort'] || 'name-desc',
  };

  const products = await getProducts(filters);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono tracking-wider uppercase hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </header>
      <main className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              New Arrivals
            </h1>
            <p className="text-muted-foreground">
              {products.length === 0 ? 'Check back soon for our latest collection' :
               `${products.length} fresh additions to our premium sportswear collection`}
            </p>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
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
                    <span className="text-sm font-semibold">{product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export const metadata = {
  title: "New Arrivals - BANANA SPORTSWEAR",
  description:
    "Discover the latest additions to our premium sportswear collection",
};
