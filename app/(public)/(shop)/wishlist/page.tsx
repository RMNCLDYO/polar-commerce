'use client';

import { useConvexAuth } from 'convex/react';
import { AlertCircle, Heart, Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Link } from '@/components/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/client/hooks/use-cart';
import { useWishlist } from '@/lib/client/hooks/use-wishlist';
import { cn } from '@/lib/shared/utils';

interface WishlistItem {
  id: Id<'wishlistItems'>;
  catalogId: Id<'catalog'>;
  addedAt: number;
  notes: string | undefined;
  product: {
    id: Id<'catalog'>;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string | null;
    polarProductId: string | undefined;
    isActive: boolean;
    inStock: boolean;
    inventory_qty: number;
  };
}

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useConvexAuth();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [movingToCart, setMovingToCart] = useState<Set<string>>(new Set());

  const handleRemove = async (
    catalogId: Id<'catalog'>,
    productInfo: { name: string; image: string; price: string },
  ) => {
    setRemovingItems((prev) => new Set(prev).add(catalogId));
    await removeFromWishlist(catalogId, productInfo);
    setRemovingItems((prev) => {
      const next = new Set(prev);
      next.delete(catalogId);
      return next;
    });
  };

  const handleMoveToCart = async (
    catalogId: Id<'catalog'>,
    productInfo: { name: string; image: string; price: string },
  ) => {
    setMovingToCart((prev) => new Set(prev).add(catalogId));
    await addToCart(catalogId, 1, productInfo);
    await removeFromWishlist(catalogId, undefined, true);
    setMovingToCart((prev) => {
      const next = new Set(prev);
      next.delete(catalogId);
      return next;
    });
  };

  const isEmpty = !wishlist || wishlist.items.length === 0;

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ viewTransitionName: 'wishlist-content' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="size-8" />
            <h1
              className="text-3xl font-bold"
              style={{ viewTransitionName: 'page-title' }}
            >
              Wishlist
            </h1>
          </div>
          {!isEmpty && (
            <Button
              variant="ghost"
              onClick={clearWishlist}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        {!isAuthenticated && !isEmpty && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Your wishlist is temporary and will be lost if you clear your
                browser data.{' '}
                <strong>Sign in to save your wishlist permanently.</strong>
              </span>
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="shrink-0">
                  Sign In
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {isEmpty ? (
          <div className="border border-border rounded-lg p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Heart className="size-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Save items you love to your wishlist and come back to them
                later.
              </p>
              <Link href="/">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item: WishlistItem | null) => {
              if (!item) return null;

              const isRemoving = removingItems.has(item.catalogId);
              const isMoving = movingToCart.has(item.catalogId);
              const isProcessing = isRemoving || isMoving;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group relative border border-border rounded-lg overflow-hidden transition-all',
                    isProcessing && 'opacity-50',
                  )}
                >
                  <Link
                    href={`/product/${item.catalogId}`}
                    className="block relative aspect-[3/4] bg-muted"
                  >
                    <Image
                      src={item.product.image || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {!item.product.inStock && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2 font-bold text-[10px] px-2 py-0.5"
                      >
                        SOLD OUT
                      </Badge>
                    )}
                  </Link>

                  <div className="p-4 space-y-3">
                    <div>
                      <Link href={`/product/${item.catalogId}`}>
                        <h3 className="text-sm font-semibold tracking-wide hover:underline">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                        {item.product.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        ${(item.product.price / 100).toFixed(2)}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline-black"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleMoveToCart(item.catalogId, {
                            name: item.product.name,
                            image: item.product.image || '/placeholder.png',
                            price: `$${(item.product.price / 100).toFixed(2)}`,
                          })
                        }
                        disabled={isProcessing || !item.product.inStock}
                      >
                        {isMoving ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : (
                          <ShoppingBag className="h-3 w-3 mr-2" />
                        )}
                        {!item.product.inStock ? 'Sold Out' : 'Add to Cart'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemove(item.catalogId, {
                            name: item.product.name,
                            image: item.product.image || '/placeholder.png',
                            price: `$${(item.product.price / 100).toFixed(2)}`,
                          })
                        }
                        disabled={isProcessing}
                        className="text-destructive hover:text-destructive"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
