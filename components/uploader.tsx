'use client';

import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function Uploader() {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Element | null)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    const firstFile = files[0];
    if (files.length > 0 && firstFile && firstFile.type.startsWith('image/')) {
      handlePhotoUpload(firstFile);
    }
  };

  const handlePhotoUpload = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Additional validation for specific image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or GIF file');
      return;
    }

    setUserPhoto(file);
    toast.success('Photo uploaded! AI generation feature coming soon.');
  };

  return (
    <>
      <section
        className="fixed bottom-8 right-8 z-40 animate-slide-up"
        style={{ animationDelay: '900ms' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Photo upload area"
      >
        <button
          type="button"
          aria-label="Upload photo for AI try-on"
          className={cn(
            'border-2 border-dashed transition-all duration-300 p-8 text-center w-64 cursor-pointer',
            isDragOver
              ? 'border-foreground bg-card shadow-lg scale-105'
              : 'border-border/50 bg-muted/20',
            'hover:shadow-md',
          )}
          onClick={() => fileInputRef.current?.click()}
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
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-pulse" />
              <h3 className="text-xs font-semibold mb-2 tracking-wide">
                PHOTO UPLOADED!
              </h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wider mb-3">
                AI generation coming soon
              </p>
              <Button
                onClick={() => {
                  setUserPhoto(null);
                  toast.info('Upload a new photo to try again');
                }}
                variant="default"
                className="w-full bg-foreground text-background hover:opacity-80 text-xs font-semibold tracking-widest uppercase rounded-none transition-opacity"
              >
                UPLOAD NEW PHOTO
              </Button>
            </>
          )}
        </button>
      </section>

      {isDragOver && (
        <div className="fixed inset-0 z-20 bg-foreground/5 border-4 border-dashed border-foreground pointer-events-none animate-in fade-in duration-200" />
      )}
    </>
  );
}
