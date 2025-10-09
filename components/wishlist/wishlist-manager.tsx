'use client';

import { useWishlistMerge } from '@/lib/client/hooks/use-wishlist';

export function WishlistManager() {
  useWishlistMerge();
  return null;
}
