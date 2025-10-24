'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const STATUS_VARIANTS = {
  active: 'default',
  trialing: 'secondary',
  canceled: 'destructive',
  incomplete: 'outline',
  incomplete_expired: 'destructive',
  past_due: 'destructive',
  unpaid: 'destructive',
} as const;

const STATUS_LABELS = {
  active: 'Active',
  trialing: 'Trial',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
  incomplete_expired: 'Expired',
  past_due: 'Past Due',
  unpaid: 'Unpaid',
} as const;

interface SubscriptionStatusProps {
  subscription: {
    status: string;
    product: { name: string };
    amount?: number | null;
    currency?: string | null;
    recurringInterval?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean | null;
  } | null;
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>You don&apos;t have an active subscription</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statusVariant = STATUS_VARIANTS[subscription.status as keyof typeof STATUS_VARIANTS] || 'outline';
  const statusLabel = STATUS_LABELS[subscription.status as keyof typeof STATUS_LABELS] || subscription.status;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>{subscription.product.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        {subscription.amount && subscription.currency && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: subscription.currency,
              }).format(subscription.amount / 100)}
              {subscription.recurringInterval && (
                <span className="text-muted-foreground text-sm ml-1">
                  / {subscription.recurringInterval}
                </span>
              )}
            </span>
          </div>
        )}
        {subscription.currentPeriodEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}
            </span>
            <span className="text-sm">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
