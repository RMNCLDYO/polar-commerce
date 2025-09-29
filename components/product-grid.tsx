import { Sparkles } from "lucide-react";
import { OptimizedLink } from "@/components/optimized-link";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

interface ProductGridProps {
  products: Product[];
  personalizedImages?: Record<string, string>;
  isPersonalized?: boolean;
}

export function ProductGrid({
  products,
  personalizedImages = {},
  isPersonalized = false,
}: ProductGridProps) {
  return (
    <section className="px-8 py-16">
      <div className="mx-auto max-w-4xl">
        <div
          className="mb-16 flex items-center justify-between animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <h2 className="text-xl font-semibold tracking-widest uppercase flex items-center gap-3">
            {isPersonalized && (
              <Sparkles className="h-5 w-5 text-foreground animate-pulse" />
            )}
            {isPersonalized ? "YOUR PERSONALIZED LOOKS" : "FEATURED PRODUCTS"}
          </h2>
          <OptimizedLink href="/products" prefetchStrategy="hover">
            <Button
              variant="outline-black-rounded"
              className="text-xs font-semibold tracking-widest uppercase px-6 hover:scale-105"
            >
              VIEW ALL
            </Button>
          </OptimizedLink>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              personalizedImage={personalizedImages[product.id]}
              isPersonalized={isPersonalized}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
