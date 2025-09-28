"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);

    logger.error("Application Error Boundary Triggered", {
      error: error.message,
      ...(error.stack && { stack: error.stack }),
      ...(error.digest && { digest: error.digest }),
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Something went wrong!
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <Button onClick={reset} variant="default" className="px-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
