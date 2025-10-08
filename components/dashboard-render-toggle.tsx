'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Server } from 'lucide-react';

export function DashboardRenderToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isServer = pathname.includes('/dashboard/server');
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (toServer: boolean) => {
    if ((toServer && isServer) || (!toServer && !isServer)) return;
    startTransition(() => {
      router.push(toServer ? '/dashboard/server' : '/dashboard');
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={!isServer ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSwitch(false)}
        disabled={isPending}
      >
        <Monitor className="h-4 w-4 mr-2" />
        Client
      </Button>
      <Button
        variant={isServer ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSwitch(true)}
        disabled={isPending}
      >
        <Server className="h-4 w-4 mr-2" />
        Server
      </Button>
    </div>
  );
}
