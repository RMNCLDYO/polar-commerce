"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  logger.error("Global Error Boundary Triggered", {
    error: error.message,
    ...(error.stack && { stack: error.stack }),
    ...(error.digest && { digest: error.digest }),
  });

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong!</h2>
              <p className="text-sm text-gray-600">
                A critical error occurred. Please try refreshing the page.
              </p>
            </div>
            <Button onClick={reset} className="px-6">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
