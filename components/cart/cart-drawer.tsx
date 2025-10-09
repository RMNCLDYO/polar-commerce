'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useCart } from '@/lib/client/hooks/use-cart';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    formattedSubtotal,
    cartValidation,
  } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = async (
    catalogId: Id<'catalog'>,
    newQuantity: number,
  ) => {
    setUpdatingItems((prev) => new Set(prev).add(catalogId));
    await updateQuantity(catalogId, newQuantity);
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(catalogId);
      return next;
    });
  };

  const handleRemoveItem = async (catalogId: Id<'catalog'>) => {
    setUpdatingItems((prev) => new Set(prev).add(catalogId));
    await removeFromCart(catalogId);
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(catalogId);
      return next;
    });
  };

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  };

  const handleProductClick = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full flex flex-col sm:max-w-md">
        <DrawerHeader className="border-b">
          <DrawerTitle>Shopping Cart</DrawerTitle>
          <DrawerDescription>
            {cart && cart.items.length > 0
              ? `${cart.itemCount} item${cart.itemCount !== 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'}
          </DrawerDescription>
        </DrawerHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add items to get started
              </p>
              <DrawerClose asChild>
                <Button variant="default">Continue Shopping</Button>
              </DrawerClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                if (!item) return null;
                const isUpdating = updatingItems.has(item.catalogId);
                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 py-4 border-b last:border-0 ${
                      isUpdating ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${item.catalogId}`}
                      onClick={handleProductClick}
                      className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.catalogId}`}
                        onClick={handleProductClick}
                        className="font-medium hover:underline block truncate"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.product.category}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.catalogId,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.catalogId,
                                item.quantity + 1,
                              )
                            }
                            disabled={isUpdating}
                            className="p-1 rounded hover:bg-muted disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.catalogId)}
                            disabled={isUpdating}
                            className="p-1 rounded hover:bg-muted text-destructive disabled:opacity-50 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price change warning */}
                      {item.price !== item.currentPrice && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                          Price changed from ${(item.price / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Clear Cart Button */}
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center py-2"
                >
                  Clear cart
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with Checkout */}
        {cart && cart.items.length > 0 && (
          <DrawerFooter className="border-t">
            {/* Validation Errors */}
            {cartValidation && !cartValidation.valid && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                {cartValidation.errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Subtotal</span>
              <span>{formattedSubtotal}</span>
            </div>

            {/* Action Buttons */}
            <Button
              onClick={handleCheckout}
              className="w-full"
              size="lg"
              disabled={cartValidation && !cartValidation.valid}
            >
              Checkout
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
