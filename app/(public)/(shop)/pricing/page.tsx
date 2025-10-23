'use client';

import { useAction, useQuery } from 'convex/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ViewTransition } from '@/components/view-transition';
import { api } from '@/convex/_generated/api';
import subscriptionsData from '@/data/subscriptions.json';
import type { CurrentUser } from '@/types/convex';

interface PolarProduct {
  id: string;
  name: string;
  description?: string;
}

type PolarProductsResponse = {
  starterMonthly?: PolarProduct;
  starterYearly?: PolarProduct;
  premiumMonthly?: PolarProduct;
  premiumYearly?: PolarProduct;
  [key: string]: PolarProduct | undefined;
};

type BillingCycle = 'monthly' | 'yearly';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const products = useQuery(api.polar.getSubscriptionProducts) as PolarProductsResponse | undefined;
  const user = useQuery(api.auth.auth.getCurrentUser) as CurrentUser | null | undefined;
  const generateCheckout = useAction(api.polar.generateCheckoutLink);
  const ensureCustomer = useAction(api.polarCustomer.ensurePolarCustomer);
  const router = useRouter();

  const { subscriptions } = subscriptionsData;

  const userTier = user?.tier || 'free';

  const handlePlanSelect = async (
    tier: string,
    cycle: BillingCycle,
    productId?: string,
  ) => {
    if (!user) {
      const returnUrl = `/pricing?plan=${tier}&cycle=${cycle}`;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (tier === 'free') {
      router.push('/pricing');
      return;
    }

    if (productId) {
      try {
        setLoading(productId);

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
        router.push(checkout.url);
      } catch {
        setLoading(null);
      }
    }
  };

  return (
    <ViewTransition name="pricing-content" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <ViewTransition name="page-title">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        </ViewTransition>
        <p className="text-xl text-muted-foreground mb-8">
          Unlock premium features and exclusive benefits
        </p>

        <div className="inline-flex items-center gap-4 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'monthly'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'yearly'
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
          const pricing = billingCycle === 'monthly'
            ? subscription.pricing.monthly
            : subscription.pricing.yearly;
          const isCurrentPlan = userTier === subscription.tier;
          const isFree = subscription.id === 'free';

          let polarProductId: string | null = null;
          if (!isFree && products) {
            const productKey = billingCycle === 'monthly'
              ? `${subscription.id}Monthly`
              : `${subscription.id}Yearly`;
            const product = Object.prototype.hasOwnProperty.call(products, productKey)
              ? products[productKey as keyof typeof products]
              : undefined;
            polarProductId = product?.id || null;
          }

          return (
            <Card
              key={subscription.id}
              className={`p-8 flex flex-col ${subscription.highlighted
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
                  (pricing as { savings?: string }).savings && (
                    <p className="text-sm text-green-600 dark:text-green-500 font-medium">
                      {(pricing as { savings: string }).savings}
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
                    void handlePlanSelect(subscription.id, billingCycle)
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
                    void handlePlanSelect(subscription.id, billingCycle)
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
                    void handlePlanSelect(
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
    </ViewTransition>
  );
}
