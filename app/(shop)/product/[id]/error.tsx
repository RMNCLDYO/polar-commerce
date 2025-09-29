'use client';

import { useEffect } from 'react';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Something went wrong!
              </h2>
              <p className="text-sm text-muted-foreground">
                {error.message ||
                  'Unable to load this product. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="default" className="px-6">
                Try again
              </Button>
              <Link href="/">
                <Button variant="outline" className="px-6">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
