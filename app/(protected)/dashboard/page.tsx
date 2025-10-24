import { preloadQuery } from 'convex/nextjs';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { DashboardClient } from './components/dashboard-client';

async function DashboardContent() {
  await headers();
  const preloadedData = await preloadQuery(api.user.dashboard.getDashboardData, {
    ordersLimit: 5,
  });

  return <DashboardClient preloadedData={preloadedData} />;
}

export default function DashboardPage() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ viewTransitionName: 'dashboard-content' }}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ viewTransitionName: 'page-title' }}
        >
          Dashboard
        </h1>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[200px] rounded-lg" />
      <Skeleton className="h-[200px] rounded-lg" />
    </div>
  );
}
