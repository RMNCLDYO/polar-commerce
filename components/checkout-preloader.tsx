'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function CheckoutPreloader() {
  useQuery(api.cart.cart.getCart, {});
  useQuery(api.cart.cart.validateCart, {});
  useQuery(api.auth.auth.getCurrentUser);

  return null;
}
