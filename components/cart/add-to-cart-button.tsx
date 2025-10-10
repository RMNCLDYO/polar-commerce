'use client';

import { Loader2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/client/hooks/use-cart';

interface AddToCartButtonProps {
  catalogId: Id<'catalog'>;
  quantity?: number;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  inStock?: boolean;
  productInfo?: { name: string; image: string; price: string };
}

export function AddToCartButton({
  catalogId,
  quantity = 1,
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  children,
  inStock = true,
  productInfo,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!inStock) return;
    setIsLoading(true);
    await addToCart(catalogId, quantity, productInfo);
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading || !inStock}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        showIcon && <ShoppingBag className="mr-2 h-4 w-4" />
      )}
      {!inStock ? 'Sold Out' : children || 'Add to Cart'}
    </Button>
  );
}
