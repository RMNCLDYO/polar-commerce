'use client';

/**
 * Customer Portal Page
 *
 * Uses @convex-dev/polar's <CustomerPortalLink> component
 * to let customers manage their subscriptions and billing
 */

import { CustomerPortalLink } from '@convex-dev/polar/react';
import { useQuery } from 'convex/react';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';

export default function CustomerPortalPage() {
  const user = useQuery(api.auth.auth.getCurrentUser);

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const subscription = user.subscription;

  return (
    <main
      className="min-h-screen px-8 py-12"
      style={{ viewTransitionName: 'portal-content' }}
    >
      <div className="mx-auto max-w-4xl">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ viewTransitionName: 'page-title' }}
        >
          Manage Subscription
        </h1>

        {subscription ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{subscription.productKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  {subscription.status}
                </span>
              </div>
              {subscription.currentPeriodStart &&
                subscription.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Current Period
                    </span>
                    <span>
                      {new Date(
                        subscription.currentPeriodStart,
                      ).toLocaleDateString()}{' '}
                      -{' '}
                      {new Date(
                        subscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
            </div>

            {/* Using Polar Component's CustomerPortalLink */}
            <CustomerPortalLink
              polarApi={api.polar}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Manage Subscription
            </CustomerPortalLink>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No Active Subscription
            </h2>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have an active subscription yet.
            </p>
            <Button asChild>
              <Link href="/pricing" prefetchStrategy="hover">
                View Plans
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
