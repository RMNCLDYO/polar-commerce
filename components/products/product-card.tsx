'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/client/hooks/use-cart';
import { logger } from '@/lib/shared/logger';
import type { Product } from '@/lib/shared/types';
import { cn } from '@/lib/shared/utils';
import { Loader2 } from 'lucide-react';

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
      <div
        className="relative mb-4 w-full overflow-hidden bg-muted/50"
        style={{ aspectRatio: '3/4' }}
      >
        {isLoading && !error && (
          <div
            className="w-full bg-muted animate-pulse"
            style={{ aspectRatio: '3/4' }}
          >
            <div className="w-full h-full bg-gradient-to-r from-muted via-accent to-muted animate-shimmer" />
          </div>
        )}

        {error && (
          <div
            className="w-full bg-muted flex items-center justify-center"
            style={{ aspectRatio: '3/4' }}
          >
            <span className="text-muted-foreground text-xs">
              Failed to load image
            </span>
          </div>
        )}

        {!error && (
          <Image
            key={product.id}
            src={imageSrc}
            alt={
              personalizedImage ? `You modeling ${product.name}` : product.name
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              'object-cover transition-all duration-500 group-hover:scale-105',
              isLoading ? 'opacity-0' : 'opacity-100',
              !product.inStock ? 'grayscale opacity-50' : '',
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={index < 2}
            unoptimized={isDataUrl || isBlobUrl}
          />
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            OUT OF STOCK
          </div>
        )}
      </div>

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
          <Button
            variant="outline-black"
            size="sm"
            className="text-xs font-semibold tracking-widest uppercase px-6 py-2 hover:scale-105"
            disabled={isAddingToCart || !product.inStock}
            onClick={async (e) => {
              e.preventDefault();
              if (!product.inStock) return;
              setIsAddingToCart(true);
              await addToCart(product.id as any, 1);
              setIsAddingToCart(false);
            }}
          >
            {isAddingToCart ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : !product.inStock ? (
              'OUT OF STOCK'
            ) : (
              'ADD'
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
