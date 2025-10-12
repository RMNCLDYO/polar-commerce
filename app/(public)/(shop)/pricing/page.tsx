'use client';

import { useAction, useQuery } from 'convex/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import subscriptionsData from '@/data/subscriptions.json';

type BillingCycle = 'monthly' | 'yearly';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const products = useQuery(api.polar.getSubscriptionProducts);
  const user = useQuery(api.auth.auth.getCurrentUser);
  const generateCheckout = useAction(api.polar.generateCheckoutLink);
  const ensureCustomer = useAction(api.polarCustomer.ensurePolarCustomer);
  const router = useRouter();

  const { subscriptions } = subscriptionsData;

  // Get current user's tier
  const userTier = user?.tier || 'free';

  const handlePlanSelect = async (
    tier: string,
    cycle: BillingCycle,
    productId?: string,
  ) => {
    if (!user) {
      // Not logged in - redirect to sign-in with plan selection
      const returnUrl = `/pricing?plan=${tier}&cycle=${cycle}`;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // User is logged in
    if (tier === 'free') {
      // Free tier - no checkout needed, just stay on pricing page
      router.push('/pricing');
      return;
    }

    // Generate checkout link for paid tier
    if (productId) {
      try {
        setLoading(productId);

        // Ensure customer exists in Polar before checkout
        // This handles the case where customer already exists from previous attempts
        await ensureCustomer({
          userId: user._id,
          email: user.email,
          name: user.name || undefined,
        });

        const checkout = await generateCheckout({
          productIds: [productId],
          origin: window.location.origin,
          successUrl: `${window.location.origin}/pricing?success=true`,
        });
        window.location.href = checkout.url;
      } catch (error) {
        console.error('Failed to generate checkout link:', error);
        setLoading(null);
      }
    }
  };

  return (
    <div
      className="container mx-auto px-4 py-16"
      style={{ viewTransitionName: 'pricing-content' }}
    >
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ viewTransitionName: 'page-title' }}
        >
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Unlock premium features and exclusive benefits
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center gap-4 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-600 dark:text-green-500 font-semibold">
              SAVE
            </span>
          </button>
        </div>

        {userTier !== 'free' && (
          <div className="mt-6 inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full">
            ✓ You&apos;re on the{' '}
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} plan
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {subscriptions.map((subscription) => {
          const pricing = subscription.pricing[billingCycle];
          const isCurrentPlan = userTier === subscription.tier;
          const isFree = subscription.id === 'free';

          // Get Polar product ID for non-free tiers
          let polarProductId: string | null = null;
          if (!isFree && products) {
            const productKey =
              `${subscription.id}${billingCycle.charAt(0).toUpperCase()}${billingCycle.slice(1)}` as keyof typeof products;
            const product = products[productKey];
            polarProductId = product?.id || null;
          }

          return (
            <Card
              key={subscription.id}
              className={`p-8 flex flex-col ${
                subscription.highlighted
                  ? 'border-2 border-primary relative'
                  : ''
              }`}
            >
              {subscription.badge && subscription.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  {subscription.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{subscription.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  ${pricing.amount}
                  <span className="text-xl text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {billingCycle === 'yearly' &&
                  'savings' in pricing &&
                  pricing.savings && (
                    <p className="text-sm text-green-600 dark:text-green-500 font-medium">
                      {pricing.savings}
                    </p>
                  )}
                <p className="text-muted-foreground mt-2">
                  {subscription.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {subscription.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {isFree ? (
                <Button
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan}
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    handlePlanSelect(subscription.id, billingCycle)
                  }
                >
                  {!user
                    ? 'Get Started Free'
                    : isCurrentPlan
                      ? 'Current Plan'
                      : 'Downgrade to Free'}
                </Button>
              ) : !user ? (
                <Button
                  className="w-full"
                  variant={subscription.highlighted ? 'default' : 'outline'}
                  size="lg"
                  onClick={() =>
                    handlePlanSelect(subscription.id, billingCycle)
                  }
                >
                  Sign in to Upgrade
                </Button>
              ) : isCurrentPlan ? (
                <Button variant="outline" disabled className="w-full" size="lg">
                  Current Plan
                </Button>
              ) : polarProductId ? (
                <Button
                  className="w-full"
                  variant={subscription.highlighted ? 'default' : 'outline'}
                  size="lg"
                  disabled={loading === polarProductId}
                  onClick={() =>
                    handlePlanSelect(
                      subscription.id,
                      billingCycle,
                      polarProductId,
                    )
                  }
                >
                  {loading === polarProductId
                    ? 'Loading...'
                    : userTier === 'free'
                      ? `Upgrade to ${subscription.name}`
                      : `Switch to ${subscription.name}`}
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full" size="lg">
                  {products === undefined
                    ? 'Loading...'
                    : 'Product not configured'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
        <p>
          All paid plans include a 30-day money-back guarantee. Cancel anytime.
        </p>
        <p>Prices shown in USD. Taxes may apply based on your location.</p>
      </div>
    </div>
  );
}
