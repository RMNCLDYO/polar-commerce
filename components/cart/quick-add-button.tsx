'use client';

import { useState } from 'react';
import { useCart } from '@/lib/client/hooks/use-cart';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';

interface QuickAddButtonProps {
  catalogId: Id<'catalog'>;
  className?: string;
  inStock?: boolean;
}

export function QuickAddButton({
  catalogId,
  className,
  inStock = true,
}: QuickAddButtonProps) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking
    if (!inStock) return;
    setIsLoading(true);
    await addToCart(catalogId, 1);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isLoading || !inStock}
      className={`text-xs font-semibold tracking-widest uppercase px-3 py-1 border border-border hover:bg-muted transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : !inStock ? (
        'OUT OF STOCK'
      ) : (
        'Quick Add'
      )}
    </button>
  );
}
