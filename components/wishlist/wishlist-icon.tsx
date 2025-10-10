'use client';

import { Heart } from 'lucide-react';
import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/lib/client/hooks/use-wishlist';

export function WishlistIcon() {
  const { wishlistCount } = useWishlist();

  return (
    <Link href="/wishlist" prefetchStrategy="hover">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Wishlist"
      >
        <Heart className="h-5 w-5" />
        {wishlistCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {wishlistCount > 99 ? '99+' : wishlistCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
