import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';
import { polar } from './polar';
import './polyfills';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// Register Polar webhook handler at /polar/events
polar.registerRoutes(http as any, {
  path: '/polar/events',
  onSubscriptionUpdated: async (ctx: any, event: any) => {
    console.log('Polar subscription updated:', event);
  },
  onSubscriptionCreated: async (ctx: any, event: any) => {
    console.log('Polar subscription created:', event);
  },
  onProductCreated: async (ctx: any, event: any) => {
    console.log('Polar product created:', event);
    // The Polar component automatically syncs products when they're created/updated
  },
  onProductUpdated: async (ctx: any, event: any) => {
    console.log('Polar product updated:', event);
    // The Polar component automatically syncs products when they're created/updated
  },
});

export default http;
