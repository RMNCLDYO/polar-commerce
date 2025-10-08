/**
 * HTTP endpoint for creating checkout sessions with IP address tracking
 * This allows us to capture the customer's IP address from request headers
 * for fraud prevention and tax calculations
 */

import { httpAction } from './_generated/server';
import { api } from './_generated/api';

/**
 * Extract customer IP address from request headers
 * Handles various proxy/CDN scenarios
 */
function getClientIp(headers: Headers): string | null {
  // Try Cloudflare header first
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Try X-Forwarded-For (may contain multiple IPs)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (client IP)
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) return firstIp.trim();
  }

  // Try X-Real-IP
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  // No IP found
  return null;
}

/**
 * HTTP endpoint: POST /api/checkout/create
 * Creates a checkout session with IP address tracking
 *
 * Request body should include all checkout options
 */
export const createCheckout = httpAction(async (ctx, request) => {
  try {
    // Parse request body
    const body = await request.json();
    console.log('[Checkout HTTP] Request body:', JSON.stringify(body, null, 2));

    // Extract customer IP from headers
    const customerIpAddress = getClientIp(request.headers);

    if (customerIpAddress) {
      console.log('[Checkout HTTP] Customer IP:', customerIpAddress);
    } else {
      console.warn('[Checkout HTTP] Could not determine customer IP address');
    }

    // This endpoint is only used for guest checkouts (IP tracking)
    // Authenticated users call the action directly from the frontend
    console.log('[Checkout HTTP] Guest checkout with IP tracking');
    console.log('[Checkout HTTP] Calling createCheckoutSession...');
    const result: any =
      // @ts-ignore
      await ctx.runAction(api.checkout.createCheckoutSession, {
        ...body,
        customerIpAddress: customerIpAddress || undefined,
      });

    console.log('[Checkout HTTP] Checkout created successfully');

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Configure based on your domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create checkout session',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    );
  }
});

/**
 * Handle OPTIONS preflight requests
 */
export const checkoutOptions = httpAction(async (_ctx, _request) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});
