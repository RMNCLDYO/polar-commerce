'use client';

import { AlertCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/components/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/client/hooks/use-cart';
import { cn } from '@/lib/shared/utils';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleRemoveItem = async (
    catalogId: Id<'catalog'>,
    productInfo: { name: string; image: string; price: string },
  ) => {
    setUpdatingItems((prev) => new Set(prev).add(catalogId));
    await removeFromCart(catalogId, productInfo);
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
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent
        className={cn(
          'flex flex-col',
          isMobile ? 'max-h-[85vh]' : 'h-full max-w-md ml-auto',
        )}
      >
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
              {cart.items.map((item: (typeof cart.items)[number]) => {
                if (!item) {return null;}
                const isUpdating = updatingItems.has(item.catalogId);
                return (
                  <div
                    key={item._id}
                    className={cn(
                      'flex gap-4 py-4 border-b last:border-0',
                      isUpdating && 'opacity-50',
                    )}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${item.catalogId}`}
                      onClick={handleProductClick}
                      className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              void handleQuantityChange(
                                item.catalogId,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              void handleQuantityChange(
                                item.catalogId,
                                item.quantity + 1,
                              )
                            }
                            disabled={isUpdating}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              void handleRemoveItem(item.catalogId, {
                                name: item.product.name,
                                image: item.product.imageUrl,
                                price: `$${(item.price / 100).toFixed(2)}`,
                              })
                            }
                            disabled={isUpdating}
                            className="h-8 w-8 text-destructive hover:text-destructive ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Price change warning */}
                      {item.price !== item.product.price && (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void clearCart()}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Clear cart
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer with Checkout */}
        {cart && cart.items.length > 0 && (
          <DrawerFooter className="border-t">
            {/* Validation Errors */}
            {cartValidation && !cartValidation.valid && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {cartValidation.errors.map((error: string, index: number) => (
                    <p key={index}>{error}</p>
                  ))}
                </AlertDescription>
              </Alert>
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
              disabled={cartValidation ? !cartValidation.valid : false}
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
