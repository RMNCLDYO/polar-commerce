'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/shared/logger';

// Map of error messages to user-friendly messages
const getUserFriendlyMessage = (error: Error): string => {
  const errorMessage = error.message?.toLowerCase() || '';

  // Network errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    return 'Unable to connect to our servers. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
    return 'The request took too long to complete. Please try again.';
  }

  // Authentication errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Permission errors
  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return 'You don\'t have permission to access this resource.';
  }

  // Not found errors
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'The requested resource could not be found.';
  }

  // Payment errors
  if (errorMessage.includes('payment') || errorMessage.includes('stripe') || errorMessage.includes('polar')) {
    return 'There was an issue processing your payment. Please try again or contact support.';
  }

  // Default message - never expose the actual error message in production
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
    // Log the full error details for debugging
    logger.error('Error boundary caught error', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
    });

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production' && error.digest) {
      // Error tracking is handled by logger with proper configuration
      // The digest can be used to correlate with server-side logs
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
          {/* Only show error details in development */}
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
