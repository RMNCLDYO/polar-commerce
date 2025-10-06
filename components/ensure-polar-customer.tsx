'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useAction } from 'convex/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';

/**
 * Component that ensures a Polar customer exists for the logged-in user
 * Also handles auto-checkout when returning from authentication with a plan selection
 */
export function EnsurePolarCustomer() {
  const user = useQuery(api.auth.getCurrentUser);
  const products = useQuery(api.polar.getSubscriptionProducts);
  const ensureCustomer = useAction(api.polarCustomer.ensurePolarCustomer);
  const generateCheckout = useAction(api.polar.generateCheckoutLink);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRun = useRef(false);
  const hasCheckout = useRef(false);

  // Ensure customer exists
  useEffect(() => {
    if (!user || hasRun.current) return;
    hasRun.current = true;

    ensureCustomer({
      userId: user._id,
      email: user.email,
    })
      .then((result) => {
        console.log(
          `✅ Polar customer ready (${result.source}):`,
          result.customerId,
        );
      })
      .catch((error) => {
        console.error('❌ Failed to ensure Polar customer:', error);
      });
  }, [user, ensureCustomer]);

  // Handle auto-checkout after authentication
  useEffect(() => {
    const selectedPlan = searchParams.get('plan');
    const selectedCycle = searchParams.get('cycle');

    if (
      !selectedPlan ||
      !selectedCycle ||
      !user ||
      !products ||
      hasCheckout.current
    ) {
      return;
    }

    hasCheckout.current = true;

    // Free tier - just clear params and stay on pricing
    if (selectedPlan === 'free') {
      router.replace('/pricing');
      return;
    }

    // Paid tier - trigger checkout
    const productKey =
      `${selectedPlan}${selectedCycle.charAt(0).toUpperCase()}${selectedCycle.slice(1)}` as keyof typeof products;
    const product = products[productKey];

    if (!product?.id) {
      console.error(`Product not found: ${productKey}`);
      router.replace('/pricing');
      return;
    }

    // Generate checkout and redirect
    generateCheckout({
      productIds: [product.id],
      successUrl: `${window.location.origin}/pricing?success=true`,
    })
      .then((checkoutUrl) => {
        // Redirect to Polar checkout
        window.location.href = checkoutUrl;
      })
      .catch((error) => {
        console.error('❌ Failed to generate checkout:', error);
        router.replace('/pricing');
      });
  }, [searchParams, user, products, generateCheckout, router]);

  return null;
}
