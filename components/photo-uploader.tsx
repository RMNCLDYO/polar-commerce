"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface PhotoUploaderProps {
  products: Product[];
  onImagesGenerated: (images: Record<string, string>) => void;
}

const techInfoMessages = [
  "Generating image for Nike ZoomX Vomero Plus",
  "Generating image for Nike Club Cap",
  "Generating image for Nike Tech Woven Pants",
  "Generating image for Jordan Fleece Hoodie",
];

export function PhotoUploader({ products, onImagesGenerated }: PhotoUploaderProps) {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
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
    setHasGenerated(false);
    setTimeout(() => {
      generatePersonalizedImagesWithFile(file);
    }, 100);
  };

  const generatePersonalizedImagesWithFile = async (file: File) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentProductIndex(0);
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

      if (generatedCount > 0) {
        toast.success(
          `Successfully generated ${generatedCount} personalized images!`,
        );
        setHasGenerated(true);
        onImagesGenerated(newPersonalizedImages);
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
    <>
      <div
        className="fixed bottom-8 right-8 z-40 animate-slide-up"
        style={{ animationDelay: "900ms" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
          ) : hasGenerated ? (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-pulse" />
              <h3 className="text-xs font-semibold mb-2 tracking-wide">
                PHOTOS GENERATED!
              </h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wider mb-3">
                Drop a new photo to generate fresh samples
              </p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-pulse" />
              <h3 className="text-sm font-semibold mb-2 tracking-wide animate-pulse">
                DROP YOUR PHOTO
              </h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wider mt-2">
                To see how the products would look on you
              </p>
            </>
          )}
        </button>
      </div>

      {isDragOver && (
        <div className="fixed inset-0 z-20 bg-foreground/5 border-4 border-dashed border-foreground pointer-events-none animate-in fade-in duration-200" />
      )}
    </>
  );
}