/**
 * Order webhook handler for post-purchase processing
 * Handles inventory decrement and cart clearing when orders are paid
 */

import { internalMutation } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';

/**
 * Process order.paid webhook
 * Decrements inventory and clears cart
 */
export const handleOrderPaid = internalMutation({
  args: {
    checkoutId: v.string(),
    orderId: v.string(),
    metadata: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    console.log('[Order Webhook] Processing order.paid:', args.orderId);
    console.log('[Order Webhook] Checkout ID:', args.checkoutId);

    const metadata = args.metadata as Record<string, any>;
    const cartId = metadata.cartId as string;
    const itemCount = metadata.itemCount as number;

    if (!cartId || !itemCount) {
      console.error('[Order Webhook] Missing cart metadata');
      return;
    }

    console.log(
      `[Order Webhook] Decrementing inventory for ${itemCount} items`,
    );

    // Decrement inventory for each purchased item
    for (let i = 0; i < itemCount; i++) {
      const productId = metadata[`item_${i}_id`] as string;
      const quantity = metadata[`item_${i}_quantity`] as number;
      const productName = metadata[`item_${i}_name`] as string;

      if (productId && quantity) {
        try {
          await ctx.scheduler.runAfter(
            0,
            internal.catalog.catalog.decrementInventoryInternal,
            {
              productId: productId as any,
              quantity,
            },
          );
          console.log(
            `  ✓ Scheduled inventory decrement for ${productName} by ${quantity}`,
          );
        } catch (error) {
          console.error(
            `  ✗ Failed to schedule inventory decrement for ${productId}:`,
            error,
          );
        }
      }
    }

    // Clear the cart
    if (cartId) {
      try {
        await ctx.scheduler.runAfter(
          0,
          internal.cart.cart.internal_clearCartItems,
          {
            cartId: cartId as any,
          },
        );
        console.log('  ✓ Scheduled cart clearing');
      } catch (error) {
        console.error('  ✗ Failed to schedule cart clearing:', error);
      }
    }

    // Archive bundle product if exists
    const bundleProductId = metadata.bundleProductId as string;
    if (bundleProductId) {
      try {
        await ctx.scheduler.runAfter(0, internal.polar.archiveBundleProduct, {
          productId: bundleProductId,
        });
        console.log('  ✓ Scheduled bundle product archival');
      } catch (error) {
        console.error('  ✗ Failed to schedule bundle archival:', error);
      }
    }

    console.log('[Order Webhook] ✓ Order processing complete');
  },
});
