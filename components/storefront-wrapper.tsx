"use client";

import type React from "react";
import { useState } from "react";
import { PhotoUploader } from "@/components/photo-uploader";
import type { Product } from "@/lib/types";

interface StorefrontWrapperProps {
  products: Product[];
  children: (props: {
    personalizedImages: Record<string, string>;
    isPersonalized: boolean;
  }) => React.ReactNode;
}

export function StorefrontWrapper({
  products,
  children,
}: StorefrontWrapperProps) {
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
      {children({ personalizedImages, isPersonalized })}
      <PhotoUploader
        products={products}
        onImagesGenerated={handleImagesGenerated}
      />
    </div>
  );
}
