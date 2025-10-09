'use client';

import { useState } from 'react';
import { Menu, X, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/link';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useConvexAuth } from 'convex/react';

const NAV_ITEMS = [
  { label: 'NEW', href: '/new' },
  { label: 'MEN', href: '/men' },
  { label: 'WOMEN', href: '/women' },
  { label: 'KIDS', href: '/kids' },
  { label: 'ACCESSORIES', href: '/accessories' },
  { label: 'PRICING', href: '/pricing' },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const { isAuthenticated } = useConvexAuth();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="h-full flex flex-col inset-y-0 right-0 left-auto w-[300px] sm:w-[350px]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-left">Menu</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <nav className="flex-1 overflow-y-auto p-6">
            <Form
              action="/products"
              className="flex items-center border border-border bg-muted px-4 py-2 hover:bg-accent transition-colors rounded-md mb-6"
              onSubmit={() => setOpen(false)}
            >
              <SearchIcon className="mr-3 size-4 text-muted-foreground shrink-0" />
              <Label htmlFor="mobile-search" className="sr-only">
                Search products
              </Label>
              <Input
                id="mobile-search"
                key={currentSearch}
                type="text"
                name="search"
                placeholder="SEARCH"
                defaultValue={currentSearch}
                aria-label="Search products"
                className="h-auto border-0 bg-transparent p-0 text-xs font-mono tracking-wider shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </Form>
            <div className="flex flex-col space-y-1">
              {NAV_ITEMS.map((item) => (
                <DrawerClose asChild key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold tracking-widest uppercase py-3 hover:text-muted-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </DrawerClose>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col space-y-1">
              {!isAuthenticated && (
                <DrawerClose asChild>
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium py-3 hover:text-muted-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                </DrawerClose>
              )}
              <DrawerClose asChild>
                <Link
                  href="/wishlist"
                  className="text-sm font-medium py-3 hover:text-muted-foreground transition-colors"
                >
                  Wishlist
                </Link>
              </DrawerClose>
              {isAuthenticated && (
                <>
                  <DrawerClose asChild>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium py-3 hover:text-muted-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Link
                      href="/settings"
                      className="text-sm font-medium py-3 hover:text-muted-foreground transition-colors"
                    >
                      Settings
                    </Link>
                  </DrawerClose>
                </>
              )}
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
}
