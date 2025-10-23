'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const getUserFriendlyMessage = (error: Error): string => {
  const errorMessage = error.message?.toLowerCase() || '';

  if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    return 'Unable to connect to our servers. Please check your internet connection and try again.';
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
    return 'The request took too long to complete. Please try again.';
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return 'You don\'t have permission to access this resource.';
  }

  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'The requested resource could not be found.';
  }

  if (errorMessage.includes('payment') || errorMessage.includes('stripe') || errorMessage.includes('polar')) {
    return 'There was an issue processing your payment. Please try again or contact support.';
  }

  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
};

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && error.digest) {
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const userMessage = getUserFriendlyMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            {userMessage}
          </p>
          {isDevelopment && error.digest && (
            <p className="text-xs text-muted-foreground font-mono mt-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <Button onClick={reset} variant="default" className="px-6">
            Try again
          </Button>
          <p className="text-xs text-muted-foreground">
            If this problem persists, please{' '}
            <a href="/contact" className="underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
