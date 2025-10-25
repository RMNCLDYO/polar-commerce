'use client';

import { type Preloaded, usePreloadedQuery } from 'convex/react';
import { LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Link } from '@/components/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/client/auth';

interface UserMenuProps {
  preloadedUser: Preloaded<typeof api.auth.auth.getCurrentUserBasic>;
}

export function UserMenu({ preloadedUser }: UserMenuProps) {
  const userData = usePreloadedQuery(preloadedUser);

  const user = userData
    ? {
        id: userData._id,
        email: userData.email,
        name: userData.name ?? null,
        image: userData.image ?? null,
      }
    : null;
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (userData === undefined) {
    return (
      <Button variant="ghost" size="icon" aria-label="Loading" disabled>
        <User className="size-5" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Link href="/sign-in">
        <Button variant="ghost" size="icon" aria-label="Sign in">
          <User className="size-5" />
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="User menu">
          <Avatar className="size-6">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={user.name || 'User'}
              />
            )}
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer flex items-center">
            <LayoutDashboard className="size-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer flex items-center">
            <Settings className="size-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSignOut()} className="cursor-pointer">
          <LogOut className="size-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
