'use client';

import { Activity, useEffect, useState } from 'react';
import { CheckoutPreloader } from '@/components/checkout-preloader';

export default function ShopLayout(props: LayoutProps<'/'>) {
  const { children } = props;
  const [preloadCheckout, setPreloadCheckout] = useState(false);

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
      <Activity mode={preloadCheckout ? 'visible' : 'hidden'}>
        <CheckoutPreloader />
      </Activity>
    </>
  );
}
