/**
 * Dedicated webhook endpoint for order.paid events
 * Handles inventory management when orders are paid
 *
 * Configure as SECOND webhook in Polar dashboard:
 * - URL: https://your-deployment.convex.site/api/webhooks/order
 * - Events: order.paid (only)
 * - Secret: Same as your main webhook
 */

import { internal } from '../_generated/api';
import { httpAction } from '../_generated/server';
import type { PolarWebhookBody } from '../types/convex_internals';
import type { CheckoutMetadata } from '../types/metadata';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/validation';

export const handleOrderWebhook = httpAction(async (ctx, request) => {
  try {
    const body = (await request.json()) as PolarWebhookBody;
    const eventType = body.type;
    logger.info('[Order Webhook] Received:', eventType);

    if (eventType !== 'order.paid') {
      logger.debug('[Order Webhook] Ignoring non-order.paid event');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const order = body.data as {
      checkout_id: string;
      id: string;
      order_id?: string;
      metadata?: CheckoutMetadata;
    };

    if (!order.checkout_id) {
      throw new ValidationError('Missing checkout_id in order data');
    }

    if (!order.id) {
      throw new ValidationError('Missing id in order data');
    }

    const checkoutId = order.checkout_id;
    const orderId = order.order_id || order.id;
    const metadata = (order.metadata || {}) as CheckoutMetadata;

    logger.info('[Order Webhook] Processing order:', orderId);
    logger.debug('[Order Webhook] Checkout ID:', checkoutId);

    if (!metadata.itemCount || typeof metadata.itemCount !== 'number') {
      logger.error('[Order Webhook] Missing or invalid itemCount in metadata');
      throw new ValidationError('Missing or invalid itemCount in metadata');
    }

    await ctx.runMutation(internal.orders.webhook.handleOrderPaid, {
      checkoutId,
      orderId,
      metadata: metadata as Record<string, string | number | boolean>,
    });

    logger.info('[Order Webhook] Order processing initiated');

    return new Response(
      JSON.stringify({ success: true, message: 'Order processed' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error || error instanceof ValidationError
        ? error.message
        : 'Unknown error';
    const statusCode = error instanceof ValidationError ? 400 : 500;
    logger.error('[Order Webhook] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
