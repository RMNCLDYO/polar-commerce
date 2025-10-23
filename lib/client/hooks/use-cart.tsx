'use client';

import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { useEffect, useEffectEvent, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { CurrentUser, CartWithItems, CartValidation } from '@/types/convex';

function getSessionId(): string {
  if (typeof window === 'undefined') {return '';}

  let sessionId = localStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
}

export function useCart() {
  const [sessionId, setSessionId] = useState<string>('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated } = useConvexAuth();

  const onAuthChange = useEffectEvent(() => {
    if (!isAuthenticated) {
      setSessionId(getSessionId());
    } else {
      setSessionId('');
      localStorage.removeItem('cart-session-id');
    }
  });

  useEffect(() => {
    onAuthChange();
  }, [isAuthenticated]);

  const cart = useQuery(api.cart.cart.getCart, sessionId ? { sessionId } : {}) as CartWithItems | null | undefined;

  const cartCount = useQuery(
    api.cart.cart.getCartCount,
    sessionId ? { sessionId } : {},
  ) as number | null | undefined;

  const cartValidation = useQuery(
    api.cart.cart.validateCart,
    sessionId ? { sessionId } : {},
  ) as CartValidation | null | undefined;

  const addToCartMutation = useMutation(api.cart.cart.addToCart);
  const updateCartItemMutation = useMutation(api.cart.cart.updateCartItem);
  const removeFromCartMutation = useMutation(api.cart.cart.removeFromCart);
  const clearCartMutation = useMutation(api.cart.cart.clearCart);
  const mergeCartMutation = useMutation(api.cart.cart.mergeCart);

  const addToCart = async (
    catalogId: Id<'catalog'>,
    quantity: number = 1,
    productInfo?: { name: string; image: string; price: string },
  ) => {
    setIsAddingToCart(true);
    try {
      await addToCartMutation({
        catalogId,
        quantity,
        sessionId: sessionId || undefined,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cart:changed', { detail: { hasItems: true } }),
        );
      }

      if (productInfo) {
        toast.custom(
          (_t) => (
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
                <p className="font-semibold text-sm">Added to cart</p>
                <p className="font-medium text-sm truncate">
                  {productInfo.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {quantity} × {productInfo.price}
                </p>
              </div>
            </div>
          ),
          { duration: 3000 },
        );
      } else {
        toast.success('Added to cart', {
          description: `${quantity} item${quantity > 1 ? 's' : ''} added to your cart`,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to cart:', error);
      }
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const updateQuantity = async (catalogId: Id<'catalog'>, quantity: number) => {
    try {
      await updateCartItemMutation({
        catalogId,
        quantity,
        sessionId: sessionId || undefined,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating cart:', error);
      }
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (
    catalogId: Id<'catalog'>,
    productInfo?: { name: string; image: string; price: string },
  ) => {
    try {
      await removeFromCartMutation({
        catalogId,
        sessionId: sessionId || undefined,
      });

      if (productInfo) {
        toast.custom(
          (_t) => (
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
                <p className="font-semibold text-sm">Removed from cart</p>
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
        toast.success('Removed from cart');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing from cart:', error);
      }
      toast.error('Failed to remove from cart');
    }
  };

  const clearCart = async () => {
    try {
      await clearCartMutation({ sessionId: sessionId || undefined });
      toast.success('Cart cleared');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing cart:', error);
      }
      toast.error('Failed to clear cart');
    }
  };

  const mergeCart = async () => {
    if (!sessionId) {return;}

    try {
      await mergeCartMutation({ sessionId });
      localStorage.removeItem('cart-session-id');
      setSessionId('');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error merging cart:', error);
      }
    }
  };

  const formattedSubtotal = cart?.subtotal
    ? `$${(cart.subtotal / 100).toFixed(2)}`
    : '$0.00';

  return {
    cart,
    cartCount: cartCount ?? 0,
    cartValidation,
    isAddingToCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeCart,
    formattedSubtotal,
    sessionId,
  };
}

export function useCartMerge() {
  const mergeCartMutation = useMutation(api.cart.cart.mergeCart);
  const user = useQuery(api.auth.auth.getCurrentUser) as CurrentUser | null | undefined;
  const [hasRunMerge, setHasRunMerge] = useState(false);

  const onUserLogin = useEffectEvent(() => {
    const sessionId =
      typeof window !== 'undefined'
        ? localStorage.getItem('cart-session-id')
        : null;

    if (user?.email && !hasRunMerge && sessionId) {
      mergeCartMutation({ sessionId })
        .then(() => {
          localStorage.removeItem('cart-session-id');
          setHasRunMerge(true);
        })
        .catch((err) => console.error('Cart merge failed:', err));
    }

    if (!user) {
      setHasRunMerge(false);
    }
  });

  useEffect(() => {
    onUserLogin();
  }, [user, hasRunMerge]);
}
