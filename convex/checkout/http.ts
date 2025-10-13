/**
 * HTTP endpoint for creating checkout sessions with IP address tracking
 * This allows us to capture the customer's IP address from request headers
 * for fraud prevention and tax calculations
 */

import { ConvexError } from 'convex/values';
import { api } from '../_generated/api';
import { httpAction } from '../_generated/server';
import type { CheckoutCustomFieldData } from '../types/metadata';
import { getCorsHeaders, getPreflightHeaders } from '../utils/cors';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/validation';
import type { CheckoutSessionResponse } from './types';

interface CheckoutRequestBody {
  sessionId?: string;
  successUrl: string;
  allowDiscountCodes?: boolean;
  isBusinessCustomer?: boolean;
  discountCode?: string;
  discountId?: string;
  customerBillingName?: string;
  customerTaxId?: string;
  customerEmail?: string;
  requireBillingAddress?: boolean;
  customFieldData?: CheckoutCustomFieldData;
  customerIpAddress?: string;
  trialInterval?: 'day' | 'week' | 'month' | 'year';
  trialIntervalCount?: number;
  subscriptionId?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Extract customer IP address from request headers
 * Handles various proxy/CDN scenarios
 */
function getClientIp(headers: Headers): string | null {
  // Try Cloudflare header first
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {return cfIp;}

  // Try X-Forwarded-For (may contain multiple IPs)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (client IP)
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) {return firstIp.trim();}
  }

  // Try X-Real-IP
  const realIp = headers.get('x-real-ip');
  if (realIp) {return realIp;}

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
  const origin = request.headers.get('origin');

  try {
    const body = (await request.json()) as CheckoutRequestBody;
    logger.debug(
      '[Checkout HTTP] Request body:',
      JSON.stringify(body, null, 2),
    );

    if (!body.successUrl || typeof body.successUrl !== 'string') {
      throw new ValidationError('successUrl is required and must be a string');
    }

    if (body.trialIntervalCount !== undefined) {
      if (
        !Number.isInteger(body.trialIntervalCount) ||
        body.trialIntervalCount <= 0
      ) {
        throw new ValidationError(
          'trialIntervalCount must be a positive integer',
        );
      }
    }

    const customerIpAddress = getClientIp(request.headers);

    if (customerIpAddress) {
      logger.info('[Checkout HTTP] Customer IP:', customerIpAddress);
    } else {
      logger.warn('[Checkout HTTP] Could not determine customer IP address');
    }

    logger.info('[Checkout HTTP] Guest checkout with IP tracking');
    logger.debug('[Checkout HTTP] Calling createCheckoutSession...');
    const result = (await ctx.runAction(
      api.checkout.checkout.createCheckoutSession,
      {
        ...body,
        customerIpAddress: customerIpAddress || undefined,
      },
    )) as CheckoutSessionResponse;

    logger.info('[Checkout HTTP] Checkout created successfully');

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error || error instanceof ValidationError
        ? error.message
        : 'Failed to create checkout session';
    const statusCode =
      error instanceof ValidationError || error instanceof ConvexError
        ? 400
        : 500;
    logger.error('Checkout creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: statusCode,
        headers: getCorsHeaders(origin),
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
    headers: getPreflightHeaders(),
  });
});
