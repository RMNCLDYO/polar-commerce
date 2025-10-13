import 'server-only';

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
 * @returns The base URL string
 * @throws Error if NEXT_PUBLIC_BASE_URL is not set in production
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // In production, require explicit configuration
  if (process.env.NODE_ENV === 'production' && !baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BASE_URL must be configured in production environment'
    );
  }

  // In development, fall back to localhost
  return baseUrl || 'http://localhost:3000';
}
