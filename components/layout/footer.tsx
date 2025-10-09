'use client';

import Image from 'next/image';
import LogoImage from '@/public/logo.png';

export function Footer() {
  return (
    <footer
      className="border-t border-border bg-muted/30 px-8 py-16 animate-slide-up"
      style={{ animationDelay: '1100ms' }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src={LogoImage}
            alt="BANANA SPORTSWEAR"
            className="h-8 w-auto opacity-40"
            width={32}
            height={32}
          />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          © {new Date().getFullYear()} BANANA SPORTSWEAR, INC. ALL RIGHTS
          RESERVED.
        </p>
      </div>
    </footer>
  );
}
