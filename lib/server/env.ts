import 'server-only';

export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (process.env.NODE_ENV === 'production' && !baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BASE_URL must be configured in production environment'
    );
  }

  return baseUrl || 'http://localhost:3000';
}
