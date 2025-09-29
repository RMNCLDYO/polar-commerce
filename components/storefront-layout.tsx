"use client";

import { useState } from "react";
import { PhotoUploader } from "@/components/photo-uploader";
import ProductGrid from "@/components/product-grid";
import StorefrontFooter from "@/components/storefront-footer";
import StorefrontHeader from "@/components/storefront-header";
import type { Product } from "@/lib/types";

interface StorefrontLayoutProps {
  products: Product[];
}

export function StorefrontLayout({ products }: StorefrontLayoutProps) {
  const [personalizedImages, setPersonalizedImages] = useState<
    Record<string, string>
  >({});
  const [isPersonalized, setIsPersonalized] = useState(false);

  const handleImagesGenerated = (images: Record<string, string>) => {
    setPersonalizedImages(images);
    setIsPersonalized(true);
  };

  return (
    <div
      role="application"
      aria-label="AI SDK Storefront"
      className="min-h-screen bg-background text-foreground font-mono animate-page-in"
    >
      <StorefrontHeader />
      <ProductGrid
        products={products}
        personalizedImages={personalizedImages}
        isPersonalized={isPersonalized}
      />
      <StorefrontFooter />
      <PhotoUploader
        products={products}
        onImagesGenerated={handleImagesGenerated}
      />
    </div>
  );
}
