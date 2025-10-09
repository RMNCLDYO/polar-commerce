'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/client/hooks/use-cart';
import { CartDrawer } from './cart-drawer';

export function CartIcon() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
        aria-label="Shopping cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>

      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
