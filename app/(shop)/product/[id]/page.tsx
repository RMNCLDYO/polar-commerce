import {
  ArrowLeft,
  Check,
  Heart,
  RefreshCw,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProduct, getProducts } from "@/lib/products";

export default async function ProductPage(
  props: PageProps<'/product/[id]'>
) {
  const { id } = await props.params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getProducts();
  const filteredRelated = relatedProducts.filter((p) => p.id !== id);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative aspect-square bg-muted/50 overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                    {product.category}
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {product.name}
                  </h1>
                </div>
                <p className="text-2xl font-semibold">{product.price}</p>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1 text-sm font-semibold tracking-widest uppercase"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" className="px-4">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      2 Year Warranty
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Easy Returns</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8 space-y-4">
                <h3 className="text-sm font-semibold tracking-widest uppercase">
                  Product Details
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5" />
                    <span>Premium quality materials</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5" />
                    <span>Designed for maximum comfort</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5" />
                    <span>Sustainable manufacturing process</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5" />
                    <span>Available in multiple sizes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {filteredRelated.length > 0 && (
            <section className="mt-20 pt-12 border-t border-border">
              <h2 className="text-xl font-semibold tracking-widest uppercase mb-8">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRelated.slice(0, 3).map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.id}`}
                    prefetch={false}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square mb-4 overflow-hidden bg-muted/50">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold tracking-wide">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                        {relatedProduct.category}
                      </p>
                      <p className="text-sm font-semibold">
                        {relatedProduct.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata(
  props: PageProps<'/product/[id]'>
) {
  const { id } = await props.params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - BANANA SPORTSWEAR`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}
