'use client';

import { useCartMerge } from '@/lib/client/hooks/use-cart';

export function CartManager() {
  useCartMerge();
  return null;
}
