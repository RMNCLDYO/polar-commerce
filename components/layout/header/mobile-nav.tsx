'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
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
          <DrawerHeader className="border-b text-left">
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>

          <nav className="flex-1 overflow-y-auto p-6">
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
              <DrawerClose asChild>
                <Link
                  href="/wishlist"
                  className="text-sm font-medium py-3 hover:text-muted-foreground transition-colors"
                >
                  Wishlist
                </Link>
              </DrawerClose>
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
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
}
