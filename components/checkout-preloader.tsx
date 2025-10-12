'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * React 19.2 Activity Component - Checkout Preloader
 *
 * Pre-renders checkout page in the background to enable instant navigation.
 * Fetches all checkout-related data (cart, validation, user) ahead of time.
 *
 * Used with <Activity mode="hidden"> to:
 * - Load data in background without blocking visible UI
 * - Fetch CSS and images for checkout page
 * - Make checkout navigation feel instant
 */
export function CheckoutPreloader() {
  // Pre-fetch all checkout-related data
  // Variables prefixed with _ to indicate intentional non-use (data prefetching only)
  useQuery(api.cart.cart.getCart, {});
  useQuery(api.cart.cart.validateCart, {});
  useQuery(api.auth.auth.getCurrentUser);

  // This component doesn't render anything - it just triggers data fetching
  // The queries above will cache results, making checkout page instant
  return null;
}
