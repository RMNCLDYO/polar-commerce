'use client';

import { type Preloaded, usePreloadedQuery } from 'convex/react';
import type { api } from '@/convex/_generated/api';
import { UserMenu } from './user-menu';

interface UserMenuClientProps {
  preloadedUser: Preloaded<typeof api.auth.auth.getCurrentUserBasic>;
}

export function UserMenuClient({ preloadedUser }: UserMenuClientProps) {
  const user = usePreloadedQuery(preloadedUser);

  return (
    <UserMenu
      user={
        user
          ? {
              id: user._id,
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
            }
          : null
      }
    />
  );
}
