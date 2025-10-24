'use client';

import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { useEffect, useEffectEvent, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { CurrentUser, WishlistWithItems, ToggleWishlistResponse } from '@/types/convex';
import { getOrCreateSessionId } from '@/lib/client/utils/session-id';

export function useWishlist() {
  const { isAuthenticated } = useConvexAuth();
  const [sessionId, setSessionId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onAuthChange = useEffectEvent(() => {
    if (!isAuthenticated) {
      setSessionId(getOrCreateSessionId('wishlist-session-id'));
    } else {
      setSessionId('');
      localStorage.removeItem('wishlist-session-id');
    }
  });

  useEffect(() => {
    onAuthChange();
  }, [isAuthenticated]);

  const wishlist = useQuery(
    api.wishlist.wishlist.getWishlist,
    sessionId ? { sessionId } : {},
  ) as WishlistWithItems | null | undefined;

  const wishlistCount = useQuery(
    api.wishlist.wishlist.getWishlistCount,
    sessionId ? { sessionId } : {},
  ) as number | null | undefined;

  const addToWishlistMutation = useMutation(
    api.wishlist.wishlist.addToWishlist,
  );
  const removeFromWishlistMutation = useMutation(
    api.wishlist.wishlist.removeFromWishlist,
  );
  const toggleWishlistMutation = useMutation(
    api.wishlist.wishlist.toggleWishlist,
  );
  const clearWishlistMutation = useMutation(
    api.wishlist.wishlist.clearWishlist,
  );
  const mergeWishlistMutation = useMutation(
    api.wishlist.wishlist.mergeWishlist,
  );

  const addToWishlist = async (catalogId: Id<'catalog'>, notes?: string) => {
    setIsProcessing(true);
    try {
      await addToWishlistMutation({
        catalogId,
        sessionId: sessionId || undefined,
        notes,
      });
      toast.success('Added to wishlist');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to wishlist:', error);
      }
      if (
        error instanceof Error &&
        error.message === 'Item already in wishlist'
      ) {
        toast.error('Item already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFromWishlist = async (
    catalogId: Id<'catalog'>,
    productInfo?: { name: string; image: string; price: string },
    silent?: boolean,
  ) => {
    setIsProcessing(true);
    try {
      await removeFromWishlistMutation({
        catalogId,
        sessionId: sessionId || undefined,
      });

      if (!silent) {
        if (productInfo) {
          toast.custom(
            () => (
              <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
                <Image
                  src={productInfo.image}
                  alt={productInfo.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Removed from wishlist</p>
                  <p className="font-medium text-sm truncate">
                    {productInfo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {productInfo.price}
                  </p>
                </div>
              </div>
            ),
            { duration: 3000 },
          );
        } else {
          toast.success('Removed from wishlist');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing from wishlist:', error);
      }
      toast.error('Failed to remove from wishlist');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleWishlist = async (
    catalogId: Id<'catalog'>,
    productInfo?: { name: string; image: string; price: string },
  ) => {
    setIsProcessing(true);
    try {
      const result = await toggleWishlistMutation({
        catalogId,
        sessionId: sessionId || undefined,
      }) as ToggleWishlistResponse;

      if (result.action === 'added') {
        if (productInfo) {
          toast.custom(
            () => (
              <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
                <Image
                  src={productInfo.image}
                  alt={productInfo.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Added to wishlist</p>
                  <p className="font-medium text-sm truncate">
                    {productInfo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {productInfo.price}
                  </p>
                </div>
              </div>
            ),
            { duration: 3000 },
          );
        } else {
          toast.success('Added to wishlist');
        }
      } else {
        if (productInfo) {
          toast.custom(
            () => (
              <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
                <Image
                  src={productInfo.image}
                  alt={productInfo.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Removed from wishlist</p>
                  <p className="font-medium text-sm truncate">
                    {productInfo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {productInfo.price}
                  </p>
                </div>
              </div>
            ),
            { duration: 3000 },
          );
        } else {
          toast.success('Removed from wishlist');
        }
      }

      return result.action;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling wishlist:', error);
      }
      toast.error('Failed to update wishlist');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearWishlist = async () => {
    setIsProcessing(true);
    try {
      await clearWishlistMutation({ sessionId: sessionId || undefined });
      toast.success('Wishlist cleared');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing wishlist:', error);
      }
      toast.error('Failed to clear wishlist');
    } finally {
      setIsProcessing(false);
    }
  };

  const mergeWishlist = async () => {
    if (!sessionId) {return;}

    try {
      await mergeWishlistMutation({ sessionId });
      localStorage.removeItem('wishlist-session-id');
      setSessionId('');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error merging wishlist:', error);
      }
    }
  };

  return {
    wishlist,
    wishlistCount: wishlistCount ?? 0,
    isProcessing,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    mergeWishlist,
    sessionId,
  };
}

export function useWishlistMerge() {
  const mergeWishlistMutation = useMutation(
    api.wishlist.wishlist.mergeWishlist,
  );
  const user = useQuery(api.auth.auth.getCurrentUser) as CurrentUser | null | undefined;
  const [hasRunMerge, setHasRunMerge] = useState(false);

  const onUserLogin = useEffectEvent(() => {
    const sessionId =
      typeof window !== 'undefined'
        ? localStorage.getItem('wishlist-session-id')
        : null;

    if (user?.email && !hasRunMerge && sessionId) {
      mergeWishlistMutation({ sessionId })
        .then(() => {
          localStorage.removeItem('wishlist-session-id');
          setHasRunMerge(true);
        })
        .catch((err) => console.error('Wishlist merge failed:', err));
    }

    if (!user) {
      setHasRunMerge(false);
    }
  });

  useEffect(() => {
    onUserLogin();
  }, [user?.email]);
}

export function useIsInWishlist(catalogId: Id<'catalog'>, sessionId?: string) {
  const isInWishlist = useQuery(
    api.wishlist.wishlist.isInWishlist,
    catalogId ? { catalogId, sessionId: sessionId || undefined } : 'skip',
  );

  return isInWishlist ?? false;
}
