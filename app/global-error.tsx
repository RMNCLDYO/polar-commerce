'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
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
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Something went wrong!
              </h2>
              <p className="text-sm text-muted-foreground">
                A critical error occurred. Please try refreshing the page.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <Button onClick={reset} variant="default" className="px-6">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
