"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const loadStartTime = useRef<number>(Date.now());

  const handleImageLoad = (): void => {
    const loadTime = Date.now() - loadStartTime.current;
    setIsLoading(false);
    setError(false);

    logger.performance(`Image load: ${product.id}`, loadTime, {
      productId: product.id,
      src: (personalizedImage || product.image).substring(0, 50),
    });
  };

  const handleImageError = (): void => {
    setIsLoading(false);
    setError(true);

    logger.error(`Failed to load image for product ${product.id}`, {
      productId: product.id,
      src: (personalizedImage || product.image).substring(0, 50),
    });
  };

  const imageSrc = personalizedImage || product.image;
  const isDataUrl = imageSrc.startsWith("data:");
  const isBlobUrl = imageSrc.startsWith("blob:");

  return (
    <Link
      href={`/product/${product.id}`}
      prefetch={false}
      className={cn(
        "group cursor-pointer animate-slide-up",
        isPersonalized ? "animate-in fade-in slide-in-from-bottom-4" : "",
      )}
      style={{
        animationDelay: isPersonalized
          ? `${index * 100}ms`
          : `${600 + index * 150}ms`,
      }}
    >
      <div className="relative mb-4 w-full overflow-hidden bg-muted/50">
        {isLoading && !error && (
          <div
            className="w-full bg-muted animate-pulse"
            style={{ aspectRatio: "1/1" }}
          >
            <div className="w-full h-full bg-gradient-to-r from-muted via-accent to-muted animate-shimmer" />
          </div>
        )}

        {error && (
          <div
            className="w-full bg-muted flex items-center justify-center"
            style={{ aspectRatio: "1/1" }}
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
            width={600}
            height={600}
            className={cn(
              "w-full h-auto object-contain transition-all duration-500 group-hover:scale-105",
              isLoading ? "opacity-0" : "opacity-100",
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={false}
            unoptimized={isDataUrl || isBlobUrl}
            style={{ height: "auto", width: "100%" }}
          />
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
            onClick={(e) => {
              e.preventDefault();
              toast.success(`${product.name} added to cart!`);
            }}
          >
            ADD
          </Button>
        </div>
      </div>
    </Link>
  );
}
