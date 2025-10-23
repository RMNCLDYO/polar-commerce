'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/client/hooks/use-cart';
import { cn } from '@/lib/shared/utils';

interface QuickAddButtonProps {
  catalogId: Id<'catalog'>;
  className?: string;
  inStock?: boolean;
  productInfo?: { name: string; image: string; price: string };
}

export function QuickAddButton({
  catalogId,
  className,
  inStock = true,
  productInfo,
}: QuickAddButtonProps) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) {return;}
    setIsLoading(true);
    await addToCart(catalogId, 1, productInfo);
    setIsLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => void handleQuickAdd(e)}
      disabled={isLoading || !inStock}
      className={cn(
        'text-xs font-semibold tracking-widest uppercase',
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : !inStock ? (
        'SOLD OUT'
      ) : (
        'ADD TO CART'
      )}
    </Button>
  );
}
