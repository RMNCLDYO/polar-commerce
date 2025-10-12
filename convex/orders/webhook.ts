/**
 * Order webhook handler for post-purchase processing
 * Handles inventory decrement and cart clearing when orders are paid
 */

import { v } from 'convex/values';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { internalMutation } from '../_generated/server';
import { logger } from '../utils/logger';

/**
 * Process order.paid webhook
 * Decrements inventory and clears cart
 */
export const handleOrderPaid = internalMutation({
  args: {
    checkoutId: v.string(),
    orderId: v.string(),
    metadata: v.record(
      v.string(),
      v.union(v.string(), v.number(), v.boolean()),
    ),
  },
  handler: async (ctx, args) => {
    logger.info('[Order Webhook] Processing order.paid:', args.orderId);
    logger.debug('[Order Webhook] Checkout ID:', args.checkoutId);

    const metadata = args.metadata as Record<string, string | number | boolean>;
    const cartId = metadata.cartId as string;
    const itemCount = metadata.itemCount as number;

    if (!cartId || !itemCount) {
      logger.error('[Order Webhook] Missing cart metadata');
      return;
    }

    logger.info(
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
              productId: productId as Id<'catalog'>,
              quantity,
            },
          );
          logger.debug(
            `Scheduled inventory decrement for ${productName} by ${quantity}`,
          );
        } catch (error) {
          logger.error(
            `Failed to schedule inventory decrement for ${productId}:`,
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
            cartId: cartId as Id<'carts'>,
          },
        );
        logger.debug('Scheduled cart clearing');
      } catch (error) {
        logger.error('Failed to schedule cart clearing:', error);
      }
    }

    // Archive bundle product if exists
    const bundleProductId = metadata.bundleProductId as string;
    if (bundleProductId) {
      try {
        await ctx.scheduler.runAfter(0, internal.polar.archiveBundleProduct, {
          productId: bundleProductId,
        });
        logger.debug('Scheduled bundle product archival');
      } catch (error) {
        logger.error('Failed to schedule bundle archival:', error);
      }
    }

    logger.info('[Order Webhook] Order processing complete');
  },
});
