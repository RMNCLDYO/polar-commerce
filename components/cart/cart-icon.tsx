'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart, useCartMerge } from '@/hooks/use-cart';
import { CartDrawer } from './cart-drawer';

export function CartIcon() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  // Automatically merge cart on auth state changes
  useCartMerge();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Shopping cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
