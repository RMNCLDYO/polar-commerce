/**
 * Single webhook endpoint that handles:
 * 1. Custom business logic (order.paid for inventory)
 * 2. Forwards ALL events to Polar component for syncing
 *
 * Configure THIS endpoint as your webhook URL in Polar dashboard:
 * https://your-deployment.convex.site/api/webhooks/polar
 */

import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

export const polarWebhookHandler = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const eventType = body.type;

    console.log('[Polar Webhook] Received:', eventType);

    // Handle order.paid for inventory management
    if (eventType === 'order.paid') {
      const order = body.data;
      const checkoutId = order.checkout_id;
      const orderId = order.id;
      const metadata = order.metadata || {};

      console.log('[Polar Webhook] Processing order.paid:', orderId);

      if (checkoutId && metadata.itemCount) {
        try {
          await ctx.runMutation(internal.orders.webhook.handleOrderPaid, {
            checkoutId,
            orderId,
            metadata,
          });
          console.log('[Polar Webhook] ✓ Order processing initiated');
        } catch (error: any) {
          console.error(
            '[Polar Webhook] ✗ Failed to process order:',
            error.message,
          );
        }
      }
    }

    // Forward to Polar component for automatic syncing
    // The component handles customers, products, subscriptions
    console.log('[Polar Webhook] Forwarding to component...');
    const componentUrl = `${process.env.CONVEX_SITE_URL}/polar/events`;

    // Get all headers from original request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Forward webhook to component
    const forwardResponse = await fetch(componentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward webhook signature for validation
        ...(headers['webhook-signature'] && {
          'webhook-signature': headers['webhook-signature'],
        }),
        ...(headers['webhook-id'] && {
          'webhook-id': headers['webhook-id'],
        }),
        ...(headers['webhook-timestamp'] && {
          'webhook-timestamp': headers['webhook-timestamp'],
        }),
      },
      body: JSON.stringify(body),
    });

    console.log(
      `[Polar Webhook] Component response: ${forwardResponse.status}`,
    );

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[Polar Webhook] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
