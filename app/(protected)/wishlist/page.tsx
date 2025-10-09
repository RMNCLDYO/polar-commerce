'use client';

import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="size-8" />
          <h1 className="text-3xl font-bold">Wishlist</h1>
        </div>

        <div className="border border-border rounded-lg p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Heart className="size-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and come back to them later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
