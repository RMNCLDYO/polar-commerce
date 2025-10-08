'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Crown,
  Sparkles,
} from 'lucide-react';
import { authClient } from '@/lib/client/auth';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const user = useQuery(api.auth.getCurrentUser);
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (user === undefined) {
    return null; // Loading
  }

  if (!user) {
    return (
      <Link href="/sign-in">
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="size-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="size-6 rounded-full"
            />
          ) : (
            <User className="size-4" />
          )}
          <span className="hidden md:inline">{user.name || user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.tier && user.tier !== 'free' && (
              <div
                className={`flex items-center gap-1 text-xs font-medium mt-2 ${
                  user.tier === 'premium'
                    ? 'text-yellow-600 dark:text-yellow-500'
                    : 'text-blue-600 dark:text-blue-500'
                }`}
              >
                <Crown className="size-3" />
                {user.tier === 'starter' ? 'Starter' : 'Premium'} Member
              </div>
            )}
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
        {user.tier !== 'premium' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/pricing"
                className="cursor-pointer flex items-center text-yellow-600 dark:text-yellow-500"
              >
                <Sparkles className="size-4 mr-2" />
                {user.tier === 'free' ? 'Upgrade to Premium' : 'Upgrade Plan'}
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="size-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
