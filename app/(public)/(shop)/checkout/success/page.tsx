'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');

  const handleCheckoutSuccess = useAction(
    api.checkout.checkout.handleCheckoutSuccess,
  );
  const order = useQuery(
    api.checkout.checkout.getOrder,
    checkoutId ? { checkoutId } : 'skip',
  );

  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCheckout = async () => {
      if (!checkoutId) {
        setError('No checkout ID found');
        setIsProcessing(false);
        return;
      }

      try {
        // Process the checkout and create order
        await handleCheckoutSuccess({ checkoutId });
        setIsProcessing(false);
      } catch (err) {
        console.error('Failed to process checkout:', err);
        setError('Failed to process order. Please contact support.');
        setIsProcessing(false);
      }
    };

    processCheckout();
  }, [checkoutId, handleCheckoutSuccess]);

  if (isProcessing) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8 py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Processing your order...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8 py-12">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Processing Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-12">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>

        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order Details */}
        {order && (
          <Card className="p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-sm">{order.checkoutId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">
                  ${(order.amount / 100).toFixed(2)} {order.currency}
                </span>
              </div>
              <div className="border-t pt-3 mt-3">
                <p className="text-sm font-semibold mb-2">Items:</p>
                {order.products.map((product, index) => (
                  <div key={index} className="text-sm flex justify-between">
                    <span>
                      {product.name} × {product.quantity}
                    </span>
                    <span>${(product.price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <Link href="/products">
            <Button className="w-full">Continue Shopping</Button>
          </Link>

          <Link href="/settings">
            <Button variant="outline" className="w-full">
              View Order History
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          If you have any questions about your order, please contact our support
          team.
        </p>
      </div>
    </main>
  );
}
