'use client';

import { useAction, useConvexAuth } from 'convex/react';
import { AlertCircle, Gift, Loader2, ShoppingBag, Tag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ViewTransition } from '@/components/view-transition';
import { api } from '@/convex/_generated/api';
import type { CheckoutCustomFieldData } from '@/convex/types/metadata';
import { useCart } from '@/lib/client/hooks/use-cart';
import { logger } from '@/lib/shared/logger';
import type { CheckoutSessionResponse } from '@/types/convex';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartValidation, sessionId } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createCheckoutAction = useAction(
    api.checkout.checkout.createCheckoutSession,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discount code support
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Business customer support
  const [isBusinessCustomer, setIsBusinessCustomer] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  // Custom field data (example: order notes)
  const [orderNotes, setOrderNotes] = useState('');

  // Redirect to products page if cart is empty or doesn't exist
  // Wait for both auth and cart to load before redirecting
  useEffect(() => {
    // Don't redirect while auth or cart is still loading
    if (isAuthLoading) {return;}

    // For guest users, wait for sessionId to be initialized
    if (!isAuthenticated && !sessionId) {return;}

    // Only redirect if cart is confirmed empty after loading
    if (cart !== undefined && (!cart || cart.items.length === 0)) {
      router.push('/products');
    }
  }, [cart, router, isAuthenticated, isAuthLoading, sessionId]);

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    // In a real app, you'd validate the discount code against Polar's API
    // For now, we'll just mark it as applied
    setDiscountApplied(true);
    setDiscountError(null);
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountError(null);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      router.push('/products');
      return;
    }
    if (!cartValidation?.valid) {return;}

    setIsLoading(true);
    setError(null);

    try {
      // Build custom field data
      const customFieldData: CheckoutCustomFieldData = {};
      if (orderNotes.trim()) {
        customFieldData.orderNotes = orderNotes;
      }

      // Build checkout options
      const checkoutOptions: Record<string, unknown> = {
        // Include sessionId for both guest and logged-in users for better tracking
        sessionId: sessionId || undefined,
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?checkout_id={CHECKOUT_ID}`,

        // Enable discount codes by default
        allowDiscountCodes: true,

        // Add business customer info if applicable
        isBusinessCustomer,
      };

      // Add discount if applied
      if (discountApplied && discountCode.trim()) {
        checkoutOptions.discountCode = discountCode.trim();
      }

      // Add company name as billing name for business customers
      if (isBusinessCustomer && companyName.trim()) {
        checkoutOptions.customerBillingName = companyName.trim();
      }

      // Add tax ID for business customers
      if (isBusinessCustomer && taxId.trim()) {
        checkoutOptions.customerTaxId = taxId.trim();
        // Require full billing address for business customers with tax ID
        checkoutOptions.requireBillingAddress = true;
      }

      // Add custom field data
      if (Object.keys(customFieldData).length > 0) {
        checkoutOptions.customFieldData = customFieldData;
      }

      let result: CheckoutSessionResponse;

      if (isAuthenticated) {
        // For authenticated users, call action directly (preserves auth context)
        logger.debug('[Checkout] Authenticated user - calling action directly');
        result = await createCheckoutAction(checkoutOptions as Parameters<typeof createCheckoutAction>[0]);
      } else {
        // For guest users, use HTTP endpoint to capture IP address
        const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
        if (!convexSiteUrl) {
          throw new Error('NEXT_PUBLIC_CONVEX_SITE_URL is not configured');
        }
        logger.debug(
          '[Checkout] Guest user - using HTTP endpoint for IP tracking',
        );

        const response = await fetch(`${convexSiteUrl}/api/checkout/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutOptions),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('[Checkout] Non-JSON response:', text);
          throw new Error(
            `Server returned non-JSON response: ${text.substring(0, 100)}`,
          );
        }

        const data = await response.json() as CheckoutSessionResponse | { error?: string };

        if (!response.ok) {
          throw new Error(
            'error' in data && data.error
              ? data.error
              : 'Failed to create checkout session',
          );
        }

        result = data as CheckoutSessionResponse;
      }

      if (!result.success || !result.checkoutUrl) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Polar checkout
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create checkout session. Please try again.';

      // If cart is empty on backend, redirect to products
      if (errorMessage.includes('Cart is empty')) {
        setError('Your cart is empty. Redirecting to products...');
        setTimeout(() => router.push('/products'), 2000);
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  // Loading state while auth or cart is loading
  // For guest users, also wait for sessionId to be initialized
  if (isAuthLoading || !cart || (!isAuthenticated && !sessionId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Empty cart
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">
            Add items to your cart to checkout
          </p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.subtotal / 100;
  const shipping: number = 0; // Free shipping
  const discountAmount = discountApplied ? subtotal * 0.1 : 0; // 10% discount example
  const total = subtotal - discountAmount + shipping;

  return (
    <ViewTransition name="checkout-content" className="min-h-screen px-8 py-12">
      <main>
        <div className="mx-auto max-w-6xl">
          <ViewTransition name="page-title">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          </ViewTransition>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Details & Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Validation Errors */}
              {cartValidation && !cartValidation.valid && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg mb-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">
                      Please review your cart:
                    </p>
                    {cartValidation.errors.map(
                      (error: string, index: number) => (
                        <p key={index}>{error}</p>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-4">
                {cart.items.map((item: (typeof cart.items)[number]) =>
                  item ? (
                    <div
                      key={item._id}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product.category}
                        </p>
                        <p className="text-sm mt-1">
                          Quantity: {item.quantity} × $
                          {(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </Card>

            {/* Discount Code */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Discount Code</h2>
              </div>

              {!discountApplied ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {handleApplyDiscount();}
                      }}
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      variant="outline"
                      disabled={!discountCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-sm text-destructive">{discountError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">
                      Code &quot;{discountCode}&quot; applied
                    </span>
                  </div>
                  <Button
                    onClick={handleRemoveDiscount}
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Card>

            {/* Business Customer */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="business"
                    checked={isBusinessCustomer}
                    onCheckedChange={(checked) =>
                      setIsBusinessCustomer(checked as boolean)
                    }
                  />
                  <Label htmlFor="business" className="text-sm font-medium">
                    I&apos;m purchasing for a business
                  </Label>
                </div>

                {isBusinessCustomer && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        placeholder="Acme Corporation"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">
                        Tax ID / VAT Number (Optional)
                      </Label>
                      <Input
                        id="taxId"
                        placeholder="GB123456789"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for EU VAT exemption
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Notes */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Order Notes (Optional)
              </h2>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                placeholder="Add any special instructions for your order..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {orderNotes.length}/500 characters
              </p>
            </Card>
          </div>

          {/* Right Column: Order Total */}
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discountApplied && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={() => void handleCheckout()}
                className="w-full"
                size="lg"
                disabled={
                  isLoading || (cartValidation ? !cartValidation.valid : false)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>

              {/* Security Note */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout powered by Polar
              </p>

              {/* Features */}
              <div className="mt-6 pt-6 border-t space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Fraud prevention enabled
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Secure payment processing
                </p>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </main>
    </ViewTransition>
  );
}
