'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/shared/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Use the logger which handles production vs development
    logger.error('Global error boundary triggered', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
    });

    // In production, you would send to an external service
    // For now, the logger handles environment-specific behavior
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
