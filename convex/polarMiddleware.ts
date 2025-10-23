import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import type { PolarWebhookBody } from './types/convex_internals';

export const polarWebhookHandler = httpAction(async (ctx, request) => {
  try {
    const body = await request.json() as PolarWebhookBody;
    const eventType = body.type;

    if (eventType === 'order.paid') {
      const order = body.data as { checkout_id: string; id: string; metadata?: Record<string, string | number | boolean> };
      const checkoutId = order.checkout_id;
      const orderId = order.id;
      const metadata = order.metadata || {} as Record<string, string | number | boolean>;

      if (checkoutId && metadata.itemCount) {
        try {
          await ctx.runMutation(internal.orders.webhook.handleOrderPaid, {
            checkoutId,
            orderId,
            metadata,
          });
        } catch {
        }
      }
    }

    const componentUrl = `${process.env.CONVEX_SITE_URL}/polar/events`;

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      Object.defineProperty(headers, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true
      });
    });

    await fetch(componentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
