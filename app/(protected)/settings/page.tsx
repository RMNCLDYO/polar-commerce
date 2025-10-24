import { preloadQuery } from 'convex/nextjs';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { SettingsClient } from './settings-client';

async function SettingsContent() {
  await headers();
  const preloadedUser = await preloadQuery(api.auth.auth.getCurrentUser);

  return <SettingsClient preloadedUser={preloadedUser} />;
}

export default function SettingsPage() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ viewTransitionName: 'settings-content' }}
    >
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-10 w-full rounded-lg mb-4" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}
