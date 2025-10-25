'use client';

import { type Preloaded, usePreloadedQuery } from 'convex/react';
import type { api } from '@/convex/_generated/api';
import { RecentOrders } from './recent-orders';
import { SubscriptionStatus } from './subscription-status';

interface DashboardClientProps {
  preloadedData: Preloaded<typeof api.user.dashboard.getDashboardData>;
}

export function DashboardClient({ preloadedData }: DashboardClientProps) {
  const data = usePreloadedQuery(preloadedData);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SubscriptionStatus subscription={data?.subscription ?? null} />
      <RecentOrders orders={data?.orders ?? []} />
    </div>
  );
}
