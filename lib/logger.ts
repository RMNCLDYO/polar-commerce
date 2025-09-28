interface LogContext {
  [key: string]: unknown;
}

interface ErrorContext extends LogContext {
  error?: unknown;
  stack?: string;
  code?: string;
  statusCode?: number;
}

interface WindowWithErrorTracker extends Window {
  errorTracker?: {
    logError: (message: string, context?: ErrorContext) => void;
  };
}

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

class Logger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return isProduction
      ? `[${timestamp}] [${level}] ${message}`
      : `[${level}] ${message}`;
  }

  error(message: string, context?: ErrorContext): void {
    const formattedMessage = this.formatMessage("ERROR", message);

    if (isDevelopment) {
      console.error(formattedMessage, context);
    } else {
      console.error(formattedMessage);

      if (
        typeof window !== "undefined" &&
        (window as WindowWithErrorTracker).errorTracker
      ) {
        (window as WindowWithErrorTracker).errorTracker.logError(
          message,
          context,
        );
      }
    }
  }

  warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage("WARN", message);

    if (isDevelopment) {
      console.warn(formattedMessage, context);
    }
  }

  info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage("INFO", message);

    if (isDevelopment) {
      console.log(formattedMessage, context);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const formattedMessage = this.formatMessage("DEBUG", message);
      console.log(formattedMessage, context);
    }
  }

  productGeneration(
    productName: string,
    status: "start" | "success" | "error",
    details?: LogContext,
  ): void {
    const message = `Product Generation: ${productName} - ${status}`;

    switch (status) {
      case "error":
        this.error(message, { productName, ...details });
        break;
      case "success":
        this.info(message, { productName, ...details });
        break;
      case "start":
        this.debug(message, { productName, ...details });
        break;
    }
  }

  apiError(
    endpoint: string,
    error: unknown,
    statusCode?: number,
  ): { message: string; details?: string; retryable: boolean } {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isNetworkError =
      errorMessage.includes("fetch") || errorMessage.includes("network");
    const isTimeout =
      errorMessage.includes("timeout") || errorMessage.includes("abort");

    this.error(`API Error: ${endpoint}`, {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      statusCode,
      endpoint,
    });

    return {
      message: isTimeout
        ? "Request timed out"
        : isNetworkError
          ? "Network error"
          : "Failed to process request",
      details: isDevelopment ? errorMessage : undefined,
      retryable: isNetworkError || isTimeout,
    };
  }

  performance(
    operation: string,
    duration: number,
    metadata?: LogContext,
  ): void {
    const message = `Performance: ${operation} took ${duration}ms`;

    if (duration > 3000) {
      this.warn(message, { operation, duration, ...metadata });
    } else if (isDevelopment) {
      this.debug(message, { operation, duration, ...metadata });
    }
  }
}

export const logger = new Logger();

export type { ErrorContext, LogContext };
