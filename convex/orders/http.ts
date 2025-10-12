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
import { logger } from '../utils/logger';

export const handleOrderWebhook = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const eventType = body.type;

    logger.info('[Order Webhook] Received:', eventType);

    // Only process order.paid events
    if (eventType !== 'order.paid') {
      logger.debug('[Order Webhook] Ignoring non-order.paid event');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const order = body.data;
    const checkoutId = order.checkout_id;
    const orderId = order.id;
    const metadata = order.metadata || {};

    logger.info('[Order Webhook] Processing order:', orderId);
    logger.debug('[Order Webhook] Checkout ID:', checkoutId);

    if (!checkoutId || !metadata.itemCount) {
      logger.error('[Order Webhook] Missing required metadata');
      return new Response(JSON.stringify({ error: 'Missing metadata' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process inventory asynchronously
    await ctx.runMutation(internal.orders.webhook.handleOrderPaid, {
      checkoutId,
      orderId,
      metadata,
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
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Order Webhook] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
