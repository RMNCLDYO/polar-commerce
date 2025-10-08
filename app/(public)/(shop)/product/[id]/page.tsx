import { Check, Heart, RefreshCw, Shield, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { getProduct, getProducts, type Product } from '@/lib/server/products';
import { cn } from '@/lib/shared/utils';

export const experimental_ppr = true;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function CachedProductContent({ id }: { id: string }) {
  'use cache';
  cacheLife('hours');
  cacheTag('products', `product-${id}`);

  const productData = getProduct(id);
  const relatedProductsData = getProducts({ excludeSubscriptions: true });

  const [product, relatedProducts] = await Promise.all([
    productData,
    relatedProductsData,
  ]);

  if (!product) {
    notFound();
  }

  const filteredRelated = relatedProducts.filter((p: Product) => p.id !== id);

  return (
    <main className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div
            className="relative bg-muted/50 overflow-hidden"
            style={{ aspectRatio: '3/4' }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={cn(
                'object-cover',
                !product.inStock && 'grayscale opacity-50',
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {!product.inStock && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full">
                OUT OF STOCK
              </div>
            )}
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

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      In Stock
                      {product.inventory_qty && product.inventory_qty <= 10 && (
                        <span className="text-muted-foreground ml-1">
                          ({product.inventory_qty} left)
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm text-red-600 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <AddToCartButton
                  productId={product.id as any}
                  size="lg"
                  className="flex-1 text-sm font-semibold tracking-widest uppercase"
                  inStock={product.inStock}
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="px-4"
                  disabled={!product.inStock}
                >
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
                  <span className="text-muted-foreground">2 Year Warranty</span>
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
              {filteredRelated.slice(0, 3).map((relatedProduct: Product) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  prefetchStrategy="hover"
                  className="group cursor-pointer"
                >
                  <div
                    className="relative mb-4 overflow-hidden bg-muted/50"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
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
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <CachedProductContent id={id} />;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const imageUrl =
    typeof product.image === 'string' ? product.image : product.image.src;

  return {
    title: `${product.name} - BANANA SPORTSWEAR`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [imageUrl],
    },
  };
}
