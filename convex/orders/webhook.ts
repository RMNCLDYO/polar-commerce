import { v } from 'convex/values';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { internalMutation } from '../_generated/server';
import type { CheckoutMetadata } from '../types/metadata';

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
    const metadata = args.metadata as CheckoutMetadata;
    const cartId = metadata.cartId;
    const itemCount = metadata.itemCount;

    if (!cartId || !itemCount) {
      return;
    }

    for (let i = 0; i < itemCount; i++) {
      const productId = metadata[`item_${i}_id`] as string;
      const quantity = metadata[`item_${i}_quantity`] as number;

      if (productId && quantity) {
        await ctx.scheduler.runAfter(
          0,
          internal.catalog.catalog.decrementInventoryInternal,
          {
            productId: productId as Id<'catalog'>,
            quantity,
          },
        );
      }
    }

    if (cartId) {
      await ctx.scheduler.runAfter(
        0,
        internal.cart.cart.internal_clearCartItems,
        {
          cartId: cartId as Id<'carts'>,
        },
      );
    }

    const bundleProductId = metadata.bundleProductId as string;
    if (bundleProductId) {
      await ctx.scheduler.runAfter(0, internal.polar.archiveBundleProduct, {
        productId: bundleProductId,
      });
    }
  },
});
