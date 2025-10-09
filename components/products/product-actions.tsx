'use client';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { AddToWishlistButton } from '@/components/wishlist/add-to-wishlist-button';
import { Id } from '@/convex/_generated/dataModel';

interface ProductActionsProps {
  catalogId: string;
  inStock?: boolean;
  productInfo?: { name: string; image: string; price: string };
}

export function ProductActions({
  catalogId,
  inStock = true,
  productInfo,
}: ProductActionsProps) {
  return (
    <div className="flex gap-3">
      <AddToCartButton
        catalogId={catalogId as Id<'catalog'>}
        size="lg"
        className="flex-1 text-sm font-semibold tracking-widest uppercase"
        inStock={inStock}
        productInfo={productInfo}
      />
      <AddToWishlistButton
        catalogId={catalogId as Id<'catalog'>}
        variant="outline"
        size="lg"
        className="px-4"
        productInfo={productInfo}
      />
    </div>
  );
}
