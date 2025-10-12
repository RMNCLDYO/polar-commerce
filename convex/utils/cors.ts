const allowedOrigins = [
  process.env.SITE_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.CONVEX_SITE_URL,
].filter((origin): origin is string => Boolean(origin));

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && allowedOrigins.includes(origin);
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0] || '';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function getPreflightHeaders(): Record<string, string> {
  const allowedOrigin = allowedOrigins[0] || '*';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
