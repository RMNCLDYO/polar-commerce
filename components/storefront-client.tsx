"use client";

import { Heart, Search, ShoppingBag, Sparkles, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { logger } from "@/lib/logger";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const techInfoMessages = [
  "Generating image for Nike ZoomX Vomero Plus",
  "Generating image for Nike Club Cap",
  "Generating image for Nike Tech Woven Pants",
  "Generating image for Jordan Fleece Hoodie",
];

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
  productId: string;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({
  src,
  alt,
  className,
  productId,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadStartTime = useRef<number>(Date.now());

  const handleLoad = (): void => {
    const loadTime = Date.now() - loadStartTime.current;
    setIsLoading(false);
    setError(false);

    logger.performance(`Image load: ${productId}`, loadTime, {
      productId,
      src: src.substring(0, 50),
    });
  };

  const handleError = (): void => {
    setIsLoading(false);
    setError(true);

    logger.error(`Failed to load image for product ${productId}`, {
      productId,
      src: src.substring(0, 50),
    });
  };

  const isDataUrl = src.startsWith("data:");
  const isBlobUrl = src.startsWith("blob:");

  return (
    <>
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
          key={productId}
          src={src}
          alt={alt}
          width={600}
          height={600}
          className={cn(
            className,
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={false}
          unoptimized={isDataUrl || isBlobUrl}
          style={{ height: "auto", width: "100%" }}
        />
      )}
    </>
  );
};

interface StorefrontClientProps {
  products: Product[];
}

export function StorefrontClient({ products }: StorefrontClientProps) {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [personalizedImages, setPersonalizedImages] = useState<
    Record<string, string>
  >({});
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<"products" | "generated">(
    "products",
  );
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    const firstFile = files[0];
    if (files.length > 0 && firstFile && firstFile.type.startsWith("image/")) {
      handlePhotoUpload(firstFile);
    }
  };

  const handlePhotoUpload = (file: File) => {
    setUserPhoto(file);
    setIsPersonalized(false);
    setPersonalizedImages({});
    setViewMode("products");
    setTimeout(() => {
      generatePersonalizedImagesWithFile(file);
    }, 100);
  };

  const generatePersonalizedImagesWithFile = async (file: File) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentProductIndex(0);
    setShowGallery(false);
    setIsTransitioning(false);
    const newPersonalizedImages: Record<string, string> = {};

    try {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product) continue;
        setCurrentProductIndex(i);

        const baseProgress = (i / products.length) * 100;
        const targetProgress = ((i + 1) / products.length) * 100;

        const animateProgress = (
          startProgress: number,
          endProgress: number,
          duration: number,
        ) => {
          return new Promise<void>((resolve) => {
            const startTime = Date.now();
            const updateInterval = 16;

            const updateProgress = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);

              const easeInOutCubic = (t: number) => {
                return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
              };

              const easedProgress = easeInOutCubic(progress);
              const currentProgress =
                startProgress + (endProgress - startProgress) * easedProgress;
              setGenerationProgress(currentProgress);

              if (progress < 1) {
                setTimeout(updateProgress, updateInterval);
              } else {
                resolve();
              }
            };

            updateProgress();
          });
        };

        const progressPromise = animateProgress(
          baseProgress,
          targetProgress,
          4000,
        );

        try {
          const productImageResponse = await fetch(product.image);
          if (!productImageResponse.ok) {
            throw new Error(
              `Failed to fetch product image for ${product.name}`,
            );
          }

          const productImageBlob = await productImageResponse.blob();
          const productImageFile = new File(
            [productImageBlob],
            `${product.id}.jpg`,
            {
              type: productImageBlob.type,
            },
          );

          const formData = new FormData();
          formData.append("userPhoto", file);
          formData.append("productImage", productImageFile);
          formData.append("productName", product.name);
          formData.append("productCategory", product.category);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const response = await fetch("/api/generate-model-image", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to generate image for ${product.name}: ${response.status} - ${errorText}`,
            );
          }

          const data = await response.json();

          if (!data.imageUrl) {
            throw new Error(`No image URL returned for ${product.name}`);
          }

          newPersonalizedImages[product.id] = data.imageUrl;
        } catch (productError) {
          console.error(
            `Error generating image for ${product.name}:`,
            productError,
          );
          newPersonalizedImages[product.id] = product.image;
        }

        await progressPromise;
      }

      const generatedCount = Object.values(newPersonalizedImages).filter(
        (url) => url.startsWith("data:"),
      ).length;

      setPersonalizedImages(newPersonalizedImages);
      setIsPersonalized(generatedCount > 0);

      if (generatedCount > 0) {
        toast.success(
          `Successfully generated ${generatedCount} personalized images!`,
        );
        setTimeout(() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setViewMode("generated");
            setTimeout(() => {
              setIsTransitioning(false);
              setTimeout(() => {
                setShowGallery(true);
              }, 300);
            }, 200);
          }, 200);
        }, 300);
      } else {
        toast.error(
          "Failed to generate personalized images. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error in generatePersonalizedImagesWithFile:", error);
      toast.error("Failed to generate personalized images. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div
      role="application"
      aria-label="AI SDK Storefront"
      className="min-h-screen bg-background text-foreground font-mono animate-page-in"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="fixed bottom-8 right-8 z-40 animate-slide-up"
        style={{ animationDelay: "900ms" }}
      >
        <button
          type="button"
          aria-label="Upload photo for AI try-on"
          className={cn(
            "border-2 border-dashed transition-all duration-300 p-8 text-center w-64 cursor-pointer",
            isDragOver
              ? "border-foreground bg-card shadow-lg scale-105"
              : "border-border/50 bg-muted/20",
            "hover:shadow-md",
          )}
          onClick={() => !userPhoto && fileInputRef.current?.click()}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />

          {!userPhoto ? (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-bounce" />
              <h3 className="text-sm font-semibold mb-2 tracking-wide animate-pulse">
                DROP YOUR PHOTO
              </h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wider mt-2">
                To see how the products would look on you
              </p>
            </>
          ) : isGenerating ? (
            <>
              <Progress value={generationProgress} className="h-2 mb-3" />
              <p className="text-xs text-muted-foreground font-mono tracking-wider animate-pulse mb-3">
                {Math.round(generationProgress)}% COMPLETE
              </p>
              <h3 className="text-xs font-semibold mb-4 tracking-wide animate-pulse transition-all duration-500 text-foreground">
                {techInfoMessages[currentProductIndex] || "Generating..."}
              </h3>
              <div className="flex justify-center mt-3 space-x-1">
                <div
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-pulse" />
              <h3 className="text-xs font-semibold mb-2 tracking-wide">
                PHOTOS GENERATED!
              </h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wider mb-3">
                Drop a new photo to generate fresh samples
              </p>
              <Button
                onClick={() => {
                  const newMode =
                    viewMode === "products" ? "generated" : "products";
                  setViewMode(newMode);
                  if (newMode === "generated") {
                    setTimeout(() => setShowGallery(true), 300);
                  } else {
                    setShowGallery(false);
                  }
                }}
                variant="default"
                className="w-full bg-foreground text-background hover:opacity-80 text-xs font-semibold tracking-widest uppercase rounded-none transition-opacity"
              >
                {viewMode === "products" ? "SHOW MY PHOTOS" : "SHOW PRODUCTS"}
              </Button>
            </>
          )}
        </button>
      </div>

      {isDragOver && (
        <div className="fixed inset-0 z-20 bg-foreground/5 border-4 border-dashed border-foreground pointer-events-none animate-in fade-in duration-200" />
      )}

      <header className="px-8 py-6 border-b border-border animate-slide-down">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/acme-logo.png"
                alt="BANANA SPORTSWEAR"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-x-12">
            {["NEW", "MEN", "WOMEN", "KIDS"].map((item, index) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs font-semibold tracking-widest uppercase hover:text-muted-foreground animate-slide-up transition-colors"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                {item}
              </Link>
            ))}
            <Button
              variant="outline-black-rounded"
              size="sm"
              className="text-xs font-semibold tracking-widest uppercase px-6 hover:scale-105 transition-transform animate-slide-up"
              style={{ animationDelay: "700ms" }}
              onClick={() => fileInputRef.current?.click()}
            >
              AI TRY-ON
            </Button>
          </nav>

          <div
            className="flex items-center gap-x-6 animate-slide-right"
            style={{ animationDelay: "500ms" }}
          >
            <div className="hidden md:flex items-center border border-border bg-muted px-4 py-2">
              <Search className="mr-3 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="SEARCH"
                className="w-24 bg-transparent text-xs font-mono tracking-wider outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Heart className="size-4 cursor-pointer hover:text-muted-foreground transition-colors" />
            <ShoppingBag className="size-4 cursor-pointer hover:text-muted-foreground transition-colors" />
            <ModeToggle />
          </div>
        </div>
      </header>

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
            <Link href="/products">
              <Button
                variant="outline-black-rounded"
                className="text-xs font-semibold tracking-widest uppercase px-6 hover:scale-105"
              >
                VIEW ALL
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className={cn(
                  "group cursor-pointer animate-slide-up",
                  isTransitioning
                    ? "opacity-80"
                    : viewMode === "generated" && showGallery
                      ? "animate-in fade-in slide-in-from-bottom-4 opacity-100"
                      : viewMode === "generated"
                        ? "opacity-0"
                        : "opacity-100",
                )}
                style={{
                  animationDelay:
                    viewMode === "generated" && showGallery
                      ? `${index * 100}ms`
                      : `${600 + index * 150}ms`,
                }}
              >
                <div className="relative mb-4 w-full overflow-hidden bg-muted/50">
                  <ImageWithLoading
                    src={
                      viewMode === "generated" && personalizedImages[product.id]
                        ? (personalizedImages[product.id] ?? product.image)
                        : product.image
                    }
                    alt={
                      viewMode === "generated" && personalizedImages[product.id]
                        ? `You modeling ${product.name}`
                        : product.name
                    }
                    className={cn(
                      "w-full h-auto object-contain transition-all duration-500 group-hover:scale-105",
                      isTransitioning ? "opacity-90" : "opacity-100",
                    )}
                    productId={product.id}
                  />
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
            ))}
          </div>
        </div>
      </section>

      <footer
        className="border-t border-border bg-muted/30 px-8 py-16 animate-slide-up"
        style={{ animationDelay: "1100ms" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/acme-logo.png"
              alt="BANANA SPORTSWEAR"
              width={128}
              height={32}
              className="h-8 w-auto opacity-40"
            />
          </div>
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            © 2025 BANANA SPORTSWEAR, INC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
