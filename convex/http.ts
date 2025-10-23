import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth/auth';
import { checkoutOptions, createCheckout } from './checkout/http';
import { polar } from './polar';
import './utils/polyfills';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

polar.registerRoutes(http, {
  onSubscriptionUpdated: async (_ctx, event) => {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('Subscription updated:', {
        subscriptionId: event.data.id,
        status: event.data.status,
        cancelledAt: event.data.customerCancellationReason,
      });
    }
  },

  onSubscriptionCreated: async (_ctx, event) => {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('Subscription created:', {
        subscriptionId: event.data.id,
        productId: event.data.productId,
        customerId: event.data.customerId,
      });
    }
  },

  onProductCreated: async (_ctx, event) => {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('Product created:', {
        productId: event.data.id,
        name: event.data.name,
      });
    }
  },

  onProductUpdated: async (_ctx, event) => {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('Product updated:', {
        productId: event.data.id,
        name: event.data.name,
      });
    }
  },
});

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
