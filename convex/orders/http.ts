import { internal } from '../_generated/api';
import { httpAction } from '../_generated/server';
import type { PolarWebhookBody } from '../types/convex_internals';
import type { CheckoutMetadata } from '../types/metadata';
import { ValidationError } from '../utils/validation';

export const handleOrderWebhook = httpAction(async (ctx, request) => {
  try {
    const body = (await request.json()) as PolarWebhookBody;
    const eventType = body.type;

    if (eventType !== 'order.paid') {
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

    if (!metadata.itemCount || typeof metadata.itemCount !== 'number') {
      throw new ValidationError('Missing or invalid itemCount in metadata');
    }

    await ctx.runMutation(internal.orders.webhook.handleOrderPaid, {
      checkoutId,
      orderId,
      metadata: metadata as Record<string, string | number | boolean>,
    });

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
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
