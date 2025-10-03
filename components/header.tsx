import { Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/components/link';
import { ModeToggle } from '@/components/mode-toggle';
import { Search } from '@/components/search';
import { UserMenu } from '@/components/user-menu';
import LogoImage from '@/public/logo.png';

export function Header() {
  return (
    <header className="px-8 py-6 border-b border-border animate-slide-down">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" prefetchStrategy="always">
            <Image
              src={LogoImage}
              alt="BANANA SPORTSWEAR"
              className="h-10 w-auto"
              priority={true}
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-12">
          {['NEW', 'MEN', 'WOMEN', 'KIDS'].map((item, index) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              prefetchStrategy="hover"
              className="text-xs font-semibold tracking-widest uppercase hover:text-muted-foreground animate-slide-up transition-colors"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div
          className="flex items-center gap-x-6 animate-slide-right"
          style={{ animationDelay: '500ms' }}
        >
          <Search />
          <Heart className="size-4 cursor-pointer hover:text-muted-foreground transition-colors" />
          <ShoppingBag className="size-4 cursor-pointer hover:text-muted-foreground transition-colors" />
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
