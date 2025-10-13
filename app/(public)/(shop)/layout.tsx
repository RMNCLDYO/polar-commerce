'use client';

import { Activity , useEffect, useState } from 'react';
import { CheckoutPreloader } from '@/components/checkout-preloader';

/**
 * React 19.2: Activity Component for Instant Checkout Navigation
 *
 * Pre-renders checkout page when cart has items, making checkout navigation instant.
 * Activity mode="hidden" renders the component without showing it or blocking visible UI.
 *
 * Benefits:
 * - Checkout data/CSS/images loaded in background
 * - Navigation feels instant
 * - Zero impact on product browsing performance
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preloadCheckout, setPreloadCheckout] = useState(false);

  // Listen for cart changes to trigger checkout preloading
  useEffect(() => {
    const handleCartChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ hasItems: boolean }>;
      if (customEvent.detail?.hasItems) {
        setPreloadCheckout(true);
      }
    };

    window.addEventListener('cart:changed', handleCartChange);
    return () => window.removeEventListener('cart:changed', handleCartChange);
  }, []);

  return (
    <>
      {children}

      {/* React 19.2: Pre-render checkout in background when cart has items */}
      <Activity mode={preloadCheckout ? 'visible' : 'hidden'}>
        <CheckoutPreloader />
      </Activity>
    </>
  );
}
