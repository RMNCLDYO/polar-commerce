'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

// Generate or get session ID for guest users
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

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

  // Initialize session ID on client side (only for guests)
  useEffect(() => {
    if (!isAuthenticated) {
      setSessionId(getSessionId());
    } else {
      // For authenticated users, clear any existing sessionId
      setSessionId('');
      localStorage.removeItem('cart-session-id');
    }
  }, [isAuthenticated]);

  // Queries
  // For authenticated users (sessionId = ''), pass empty object to use userId from auth context
  // For guest users, pass sessionId
  const cart = useQuery(api.cart.cart.getCart, sessionId ? { sessionId } : {});

  const cartCount = useQuery(
    api.cart.cart.getCartCount,
    sessionId ? { sessionId } : {},
  );

  const cartValidation = useQuery(
    api.cart.cart.validateCart,
    sessionId ? { sessionId } : {},
  );

  // Mutations
  const addToCartMutation = useMutation(api.cart.cart.addToCart);
  const updateCartItemMutation = useMutation(api.cart.cart.updateCartItem);
  const removeFromCartMutation = useMutation(api.cart.cart.removeFromCart);
  const clearCartMutation = useMutation(api.cart.cart.clearCart);
  const mergeCartMutation = useMutation(api.cart.cart.mergeCart);

  // Add to cart with optimistic UI feedback
  const addToCart = async (catalogId: Id<'catalog'>, quantity: number = 1) => {
    // For authenticated users, sessionId will be empty but mutation still works via userId from auth
    setIsAddingToCart(true);
    try {
      await addToCartMutation({
        catalogId,
        quantity,
        sessionId: sessionId || undefined,
      });
      toast.success('Added to cart', {
        description: `${quantity} item${quantity > 1 ? 's' : ''} added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Update cart item quantity
  const updateQuantity = async (catalogId: Id<'catalog'>, quantity: number) => {
    try {
      await updateCartItemMutation({
        catalogId,
        quantity,
        sessionId: sessionId || undefined,
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  // Remove from cart
  const removeFromCart = async (catalogId: Id<'catalog'>) => {
    try {
      await removeFromCartMutation({
        catalogId,
        sessionId: sessionId || undefined,
      });
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await clearCartMutation({ sessionId: sessionId || undefined });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Merge guest cart with user cart after login
  const mergeCart = async () => {
    if (!sessionId) return;

    try {
      await mergeCartMutation({ sessionId });
      // Clear session ID after merge - authenticated users use userId for cart lookups
      localStorage.removeItem('cart-session-id');
      setSessionId(''); // Don't generate new sessionId for authenticated users
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  // Calculate formatted prices
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

// Hook for auth state changes to merge carts
export function useCartMerge() {
  const { mergeCart } = useCart();
  const user = useQuery(api.auth.auth.getCurrentUser);
  const [hasRunMerge, setHasRunMerge] = useState(false);

  useEffect(() => {
    // Only merge once when user logs in (not on sign out)
    if (user && user.email && !hasRunMerge) {
      mergeCart();
      setHasRunMerge(true);
    }

    // Reset flag when user signs out
    if (!user) {
      setHasRunMerge(false);
    }
  }, [user, hasRunMerge, mergeCart]);
}
