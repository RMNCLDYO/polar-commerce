'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
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
                  'Unable to load this category. Please try again.'}
              </p>
            </div>
            <Button onClick={reset} variant="default" className="px-6">
              Try again
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
