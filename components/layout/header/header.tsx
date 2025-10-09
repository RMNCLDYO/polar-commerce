import Image from 'next/image';
import { Link } from '@/components/link';
import { ThemeToggle } from '@/components/layout/header/theme-toggle';
import { Search } from '@/components/layout/header/search';
import { UserMenuClient } from '@/components/layout/header/user-menu-client';
import { CartIcon } from '@/components/cart/cart-icon';
import { WishlistIcon } from '@/components/wishlist/wishlist-icon';
import { MobileNav } from '@/components/layout/header/mobile-nav';
import LogoImage from '@/public/logo.png';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { headers } from 'next/headers';

const NAV_ITEMS = [
  { label: 'NEW', hideBelow: '' }, // Always visible when nav is visible
  { label: 'MEN', hideBelow: 'max-[820px]:hidden' },
  { label: 'WOMEN', hideBelow: 'max-[900px]:hidden' },
  { label: 'KIDS', hideBelow: 'max-[980px]:hidden' },
  { label: 'ACCESSORIES', hideBelow: 'max-[1080px]:hidden' },
  { label: 'PRICING', hideBelow: 'max-[1180px]:hidden' }, // First to hide
] as const;

async function UserMenuWrapper() {
  await headers(); // Opt into dynamic rendering
  const preloadedUser = await preloadQuery(api.auth.auth.getCurrentUserBasic);

  return <UserMenuClient preloadedUser={preloadedUser} />;
}

export function Header() {
  return (
    <header className="px-8 py-6 border-b border-border animate-slide-down">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link href="/" prefetchStrategy="always">
            <Image
              src={LogoImage}
              alt="BANANA SPORTSWEAR"
              className="h-10 w-auto"
              priority={true}
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-8">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.label}
              href={`/${item.label.toLowerCase()}`}
              prefetchStrategy="hover"
              className={`${item.hideBelow} text-xs font-semibold tracking-widest uppercase hover:text-muted-foreground animate-slide-up transition-colors whitespace-nowrap`}
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className="flex items-center gap-x-6 animate-slide-right"
          style={{ animationDelay: '500ms' }}
        >
          <Search />
          <WishlistIcon />
          <CartIcon />
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="size-9 rounded-md" />}>
            <UserMenuWrapper />
          </Suspense>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
