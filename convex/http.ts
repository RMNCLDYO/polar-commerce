import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';
import { polar } from './polar';
import { createCheckout, checkoutOptions } from './checkoutHttp';
import './polyfills';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// ============================================
// POLAR COMPONENT WEBHOOK HANDLER
// ============================================
// The @convex-dev/polar component handles ALL webhook routing automatically
// This includes signature validation using the Standard Webhooks spec
//
// Configure in Polar dashboard: Settings > Webhooks > Webhook #1
// URL: https://your-deployment.convex.site/polar/events
// Secret: Set via POLAR_WEBHOOK_SECRET env var
//
// Events to enable:
// - customer.created, customer.updated, customer.deleted
// - product.created, product.updated
// - subscription.created, subscription.updated
//
// The component automatically syncs:
// - Customers (created, updated, deleted)
// - Products (created, updated)
// - Subscriptions (created, updated, active, canceled, uncanceled, revoked)
polar.registerRoutes(http as any, {
  // Optional: Custom path (defaults to "/polar/events")
  // path: "/polar/events",

  // Optional: Custom webhook event handlers
  // Note: Component auto-syncs customers, products, subscriptions
  // These callbacks are for custom business logic only

  onSubscriptionUpdated: async (_ctx, event) => {
    console.log('[Polar Component] Subscription updated:', event.data.id);

    if (event.data.customerCancellationReason) {
      console.log(
        `[Polar Component] Customer cancelled: ${event.data.customerCancellationReason}`,
      );
    }
  },

  onSubscriptionCreated: async (_ctx, event) => {
    console.log('[Polar Component] New subscription:', event.data.id);
  },

  onProductCreated: async (_ctx, event) => {
    console.log('[Polar Component] New product:', event.data.name);
  },

  onProductUpdated: async (_ctx, event) => {
    console.log('[Polar Component] Product updated:', event.data.name);
  },
});

// Checkout API with IP address tracking
// POST /api/checkout/create
// Captures customer IP from headers for fraud prevention and tax calculation
http.route({
  path: '/api/checkout/create',
  method: 'POST',
  handler: createCheckout,
});

http.route({
  path: '/api/checkout/create',
  method: 'OPTIONS',
  handler: checkoutOptions,
});

export default http;
