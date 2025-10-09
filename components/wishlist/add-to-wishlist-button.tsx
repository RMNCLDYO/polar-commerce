'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { useWishlist, useIsInWishlist } from '@/lib/client/hooks/use-wishlist';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/shared/utils';

interface AddToWishlistButtonProps {
  catalogId: Id<'catalog'>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
  productInfo?: { name: string; image: string; price: string };
}

export function AddToWishlistButton({
  catalogId,
  variant = 'ghost',
  size = 'icon',
  className,
  showText = false,
  productInfo,
}: AddToWishlistButtonProps) {
  const { toggleWishlist, sessionId } = useWishlist();
  const isInWishlist = useIsInWishlist(catalogId, sessionId);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await toggleWishlist(catalogId, productInfo);
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleToggle}
      variant={variant}
      size={size}
      className={cn('transition-colors', className)}
      disabled={isLoading}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn('h-4 w-4', isInWishlist && 'fill-red-500 text-red-500')}
        />
      )}
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  );
}
