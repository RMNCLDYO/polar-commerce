import type { Route } from 'next';
import Image from 'next/image';
import { CartIcon } from '@/components/cart/cart-icon';
import { MobileNav } from '@/components/layout/header/mobile-nav';
import { Search } from '@/components/layout/header/search';
import { ThemeToggle } from '@/components/layout/header/theme-toggle';
import { UserMenu } from '@/components/layout/header/user-menu';
import { Link } from '@/components/link';
import { WishlistIcon } from '@/components/wishlist/wishlist-icon';
import LogoImage from '@/public/logo.png';

const NAV_ITEMS = [
  { label: 'NEW', hideBelow: '' },
  { label: 'MEN', hideBelow: 'max-[820px]:hidden' },
  { label: 'WOMEN', hideBelow: 'max-[900px]:hidden' },
  { label: 'KIDS', hideBelow: 'max-[980px]:hidden' },
  { label: 'ACCESSORIES', hideBelow: 'max-[1080px]:hidden' },
  { label: 'PRICING', hideBelow: 'max-[1180px]:hidden' },
] as const;

export function Header() {
  return (
    <header className="px-8 py-6 border-b border-border animate-slide-down">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link href="/" prefetchStrategy="always">
            <Image
              src={LogoImage}
              alt="Polar Commerce"
              className="h-10 w-auto"
              priority={true}
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-8">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.label}
              href={`/${item.label.toLowerCase()}` as Route}
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
          <UserMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
