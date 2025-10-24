import { ConvexError } from 'convex/values';
import { httpAction } from '../_generated/server';
import type { CheckoutCustomFieldData } from '../types/metadata';
import { getCorsHeaders, getPreflightHeaders } from '../utils/cors';
import { ValidationError } from '../utils/validation';
import { createCheckoutSessionHelper } from './checkout';

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
  trialInterval?: 'day' | 'week' | 'month' | 'year';
  trialIntervalCount?: number;
  subscriptionId?: string;
  metadata?: Record<string, string | number | boolean>;
}

function getClientIp(headers: Headers): string | null {
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {return cfIp;}

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) {return firstIp.trim();}
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {return realIp;}

  return null;
}

export const createCheckout = httpAction(async (ctx, request) => {
  const origin = request.headers.get('origin');

  try {
    const body = (await request.json()) as CheckoutRequestBody;

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

    const result = await createCheckoutSessionHelper(ctx, {
      ...body,
      customerIpAddress: customerIpAddress || undefined,
    });

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

export const checkoutOptions = httpAction(async () => {
  return new Response(null, {
    status: 204,
    headers: getPreflightHeaders(),
  });
});
