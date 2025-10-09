'use client';

import { useCartMerge } from '@/lib/client/hooks/use-cart';

/**
 * Cart manager component that handles cart merging on login
 * This component should be included in the root layout to ensure
 * guest carts are automatically merged when users sign in
 */
export function CartManager() {
  useCartMerge();
  return null;
}
