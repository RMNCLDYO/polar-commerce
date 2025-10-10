'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Link } from '@/components/link';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AddToWishlistButton } from '@/components/wishlist/add-to-wishlist-button';
import type { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/client/hooks/use-cart';
import { logger } from '@/lib/shared/logger';
import type { Product } from '@/lib/shared/types';
import { cn } from '@/lib/shared/utils';

interface ProductCardProps {
  product: Product;
  personalizedImage?: string;
  isPersonalized?: boolean;
  index: number;
}

export function ProductCard({
  product,
  personalizedImage,
  isPersonalized = false,
  index,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const loadStartTime = useRef<number>(Date.now());
  const { addToCart } = useCart();

  const handleImageLoad = (): void => {
    const loadTime = Date.now() - loadStartTime.current;
    setIsLoading(false);
    setError(false);

    const srcForLog =
      personalizedImage ||
      (typeof product.image === 'string' ? product.image : product.image.src);
    logger.performance(`Image load: ${product.id}`, loadTime, {
      productId: product.id,
      src: srcForLog.substring(0, 50),
    });
  };

  const handleImageError = (): void => {
    setIsLoading(false);
    setError(true);

    const srcForLog =
      personalizedImage ||
      (typeof product.image === 'string' ? product.image : product.image.src);
    logger.error(`Failed to load image for product ${product.id}`, {
      productId: product.id,
      src: srcForLog.substring(0, 50),
    });
  };

  const imageSrc = personalizedImage || product.image;
  const isDataUrl =
    typeof imageSrc === 'string' && imageSrc.startsWith('data:');
  const isBlobUrl =
    typeof imageSrc === 'string' && imageSrc.startsWith('blob:');

  return (
    <Link
      href={`/product/${product.id}`}
      prefetchStrategy="hover"
      className={cn(
        'group cursor-pointer animate-slide-up',
        isPersonalized ? 'animate-in fade-in slide-in-from-bottom-4' : '',
      )}
      style={{
        animationDelay: isPersonalized
          ? `${index * 100}ms`
          : `${600 + index * 150}ms`,
      }}
    >
      <AspectRatio ratio={3 / 4} className="mb-4 overflow-hidden relative">
        {isLoading && !error && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}

        {error && (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-xs">
              Failed to load image
            </span>
          </div>
        )}

        {!error && (
          <div
            className={cn(
              'absolute inset-0 transition-all duration-500',
              !product.inStock &&
                'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100',
            )}
          >
            <Image
              key={product.id}
              src={imageSrc}
              alt={
                personalizedImage
                  ? `You modeling ${product.name}`
                  : product.name
              }
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-105',
                isLoading ? 'opacity-0' : 'opacity-100',
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={index < 2}
              unoptimized={isDataUrl || isBlobUrl}
            />
          </div>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 font-bold z-10 text-[10px] px-2 py-0.5"
          >
            SOLD OUT
          </Badge>
        )}
      </AspectRatio>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
            {product.category}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide">
            {product.price}
          </span>
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
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold tracking-widest uppercase"
              disabled={isAddingToCart || !product.inStock}
              onClick={async (e) => {
                e.preventDefault();
                if (!product.inStock) return;
                setIsAddingToCart(true);
                await addToCart(product.id as Id<'catalog'>, 1, {
                  name: product.name,
                  image:
                    typeof product.image === 'string'
                      ? product.image
                      : product.image.src,
                  price: product.price,
                });
                setIsAddingToCart(false);
              }}
            >
              {isAddingToCart ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : !product.inStock ? (
                'SOLD OUT'
              ) : (
                'ADD TO CART'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
