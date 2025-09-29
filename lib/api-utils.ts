import 'server-only';

// This file contains utilities that should only be used on the server
// such as API key handling, database connections, etc.

export function getApiKey(): string | undefined {
  return process.env.AI_GATEWAY_API_KEY;
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://aisdk-storefront.vercel.app';
}