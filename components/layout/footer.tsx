import { unstable_cache } from 'next/cache';
import Image from 'next/image';
import LogoImage from '@/public/logo.png';

const getCopyrightYear = unstable_cache(
  async () => new Date().getFullYear(),
  ['copyright-year'],
  { revalidate: 86400 },
);

export async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer
      className="border-t border-border bg-muted/30 px-8 py-16 animate-slide-up"
      style={{ animationDelay: '1100ms' }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src={LogoImage}
            alt="Polar Commerce"
            className="h-8 w-auto opacity-40"
            width={32}
            height={32}
          />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          © {year} Polar Commerce, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
