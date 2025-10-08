/**
 * Checkout Integration using @convex-dev/polar Component
 *
 * This file provides TWO checkout approaches:
 *
 * 1. **Component-based (PREFERRED)**: Use polar.generateCheckoutLink() for simple subscriptions
 *    - Automatic customer linking
 *    - Built-in authentication
 *    - Minimal code
 *
 * 2. **Advanced (FALLBACK)**: Use manual SDK calls for:
 *    - Discount codes
 *    - Business customers
 *    - Custom fields
 *    - IP tracking
 *    - Trial periods
 *    - Subscription upgrades
 *
 * PRIORITY: Component > SDK > API
 */

import { v } from 'convex/values';
import { action } from './_generated/server';
import { Polar as PolarSDK } from '@polar-sh/sdk';

/**
 * COMPONENT-BASED CHECKOUT (Preferred)
 *
 * For simple checkouts, use the component's API directly:
 * - api.polar.generateCheckoutLink - Create checkout URL
 * - <CheckoutLink> component - React component for checkout button
 *
 * The component handles:
 * - Customer creation/linking
 * - Authentication
 * - Redirect URLs
 *
 * Note: We don't wrap generateCheckoutLink here because it causes TypeScript
 * type recursion issues. Use it directly from api.polar.generateCheckoutLink
 */

/**
 * ADVANCED CHECKOUT (Fallback to SDK)
 *
 * Use this when you need features the component doesn't support:
 * - Discount codes
 * - Business customer info
 * - Custom fields
 * - IP address tracking
 * - Trial periods
 */
export const createAdvancedCheckout = action({
  args: {
    productIds: v.array(v.string()),
    successUrl: v.string(),

    // Advanced features not in component
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    allowDiscountCodes: v.optional(v.boolean()),
    isBusinessCustomer: v.optional(v.boolean()),
    customerBillingName: v.optional(v.string()),
    customerTaxId: v.optional(v.string()),
    requireBillingAddress: v.optional(v.boolean()),
    customFieldData: v.optional(v.record(v.string(), v.any())),
    customerIpAddress: v.optional(v.string()),

    // Trial configuration
    trialInterval: v.optional(v.string()),
    trialIntervalCount: v.optional(v.number()),

    // Subscription upgrade
    subscriptionId: v.optional(v.string()),

    embedOrigin: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get user info from auth identity instead of calling getCurrentUser
    // to avoid TypeScript type recursion issues
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error('User not authenticated');
    }

    const user = {
      _id: identity.subject,
      email: identity.email,
      name: identity.name || null,
    };

    // Initialize SDK for advanced features
    const polarClient = new PolarSDK({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    // Build advanced checkout data
    const checkoutData: any = {
      products: args.productIds,
      success_url: args.successUrl,

      // Customer info
      external_customer_id: user._id,
      customer_email: user.email,
      customer_name: user.name,

      // Advanced features the component doesn't support
      ...(args.discountId && { discount_id: args.discountId }),
      ...(args.allowDiscountCodes !== undefined && {
        allow_discount_codes: args.allowDiscountCodes,
      }),
      ...(args.isBusinessCustomer !== undefined && {
        is_business_customer: args.isBusinessCustomer,
      }),
      ...(args.customerBillingName && {
        customer_billing_name: args.customerBillingName,
      }),
      ...(args.customerTaxId && { customer_tax_id: args.customerTaxId }),
      ...(args.requireBillingAddress !== undefined && {
        require_billing_address: args.requireBillingAddress,
      }),
      ...(args.customFieldData && { custom_field_data: args.customFieldData }),
      ...(args.customerIpAddress && {
        customer_ip_address: args.customerIpAddress,
      }),
      ...(args.trialInterval && { trial_interval: args.trialInterval }),
      ...(args.trialIntervalCount && {
        trial_interval_count: args.trialIntervalCount,
      }),
      ...(args.subscriptionId && { subscription_id: args.subscriptionId }),
      ...(args.embedOrigin && { embed_origin: args.embedOrigin }),

      // Metadata
      metadata: {
        userId: user._id,
        ...(args.metadata || {}),
      },

      // Separate customer metadata
      customer_metadata: {
        source: 'storefront',
        userId: user._id,
      },
    };

    const checkout = await polarClient.checkouts.create(checkoutData);

    if (!checkout || !checkout.url) {
      throw new Error('Failed to create checkout session');
    }

    return {
      success: true,
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
      clientSecret: checkout.clientSecret,
      amount: checkout.totalAmount,
      currency: checkout.currency,
      status: checkout.status,
      expiresAt: checkout.expiresAt,
    };
  },
});

/**
 * SMART CHECKOUT ROUTER
 *
 * Note: Due to TypeScript type recursion issues with the Polar component's
 * generateCheckoutLink, we always use the SDK-based checkout (createAdvancedCheckout).
 *
 * For simple use cases where you don't need advanced features (discounts, custom fields, etc),
 * you can call api.polar.generateCheckoutLink directly from your frontend or use the
 * <CheckoutLink> React component.
 */
export const createCheckout = createAdvancedCheckout;

/**
 * SUBSCRIPTION QUERIES
 *
 * The @convex-dev/polar component provides subscription queries directly via
 * components.polar.lib:
 *
 * - getCurrentSubscription: Get user's current subscription (for single-subscription apps)
 * - listUserSubscriptions: Get all user subscriptions (for multi-subscription apps)
 *
 * Usage in frontend:
 *
 * ```tsx
 * import { components } from '@/convex/_generated/api';
 * import { useQuery } from 'convex/react';
 *
 * // Get current user
 * const user = useQuery(api.auth.getCurrentUser);
 *
 * // Get subscription directly from component
 * const subscription = useQuery(
 *   components.polar.lib.getCurrentSubscription,
 *   user ? { userId: user._id } : 'skip'
 * );
 * ```
 *
 * Usage in backend queries/actions:
 *
 * ```ts
 * import { components } from './_generated/api';
 *
 * export const myQuery = query({
 *   handler: async (ctx) => {
 *     const identity = await ctx.auth.getUserIdentity();
 *     if (!identity) return null;
 *
 *     const subscription = await ctx.runQuery(
 *       components.polar.lib.getCurrentSubscription,
 *       { userId: identity.subject }
 *     );
 *     return subscription;
 *   }
 * });
 * ```
 *
 * When the official @convex-dev/polar package is updated with these features,
 * no changes will be needed to your code - just update the package version.
 */
