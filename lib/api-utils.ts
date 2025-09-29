import "server-only";

/**
 * Server-only utilities for API configuration and environment variables.
 * These functions should only be used in Server Components and API Routes.
 */

/**
 * Gets the Google Generative AI API key from environment variables.
 * This is automatically used by Vercel AI SDK when making requests to Google Gemini.
 * @returns The API key if set, undefined otherwise
 */
export function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

/**
 * Gets the application base URL for metadata generation.
 * Falls back to production URL if NEXT_PUBLIC_BASE_URL is not set.
 * @returns The base URL string
 */
export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL || "https://aisdk-storefront.vercel.app"
  );
}
