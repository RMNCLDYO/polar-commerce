'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { RecentOrders } from './recent-orders';
import { SubscriptionStatus } from './subscription-status';

export function DashboardClient() {
  const data = useQuery(api.user.dashboard.getDashboardData, {
    ordersLimit: 5,
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SubscriptionStatus subscription={data?.subscription ?? null} />
      <RecentOrders orders={data?.orders ?? []} />
    </div>
  );
}
