import { Filter, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              BANANA SPORTSWEAR
            </Link>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              All Products
            </h1>
            <p className="text-muted-foreground">
              Discover our complete collection of premium sportswear
            </p>
          </div>

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
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {product.price}
                    </span>
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
    </div>
  );
}

export const metadata = {
  title: "All Products - BANANA SPORTSWEAR",
  description:
    "Browse our complete collection of premium athletic gear and sportswear",
};
