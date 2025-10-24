import { components } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import type { ActionCtx, MutationCtx } from '../_generated/server';
import type { CartItemForCheckout } from '../checkout/types';

export async function createOrder(
  ctx: MutationCtx,
  data: {
    checkoutId: string;
    userId?: string;
    email?: string;
    customerId?: string;
    status: string;
    amount: number;
    discountAmount?: number;
    taxAmount?: number;
    totalAmount?: number;
    currency: string;
    products: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    customerName?: string;
    customerIpAddress?: string;
    isBusinessCustomer?: boolean;
    customerTaxId?: string;
    billingAddress?: {
      line1?: string;
      line2?: string;
      postal_code?: string;
      city?: string;
      state?: string;
      country: string;
    };
    discountId?: string;
    discountCode?: string;
    trialInterval?: string;
    trialIntervalCount?: number;
    trialEnd?: number;
    subscriptionId?: string;
    metadata?: Record<string, string | number | boolean>;
    customFieldData?: Record<string, string | number | boolean>;
  },
): Promise<Id<'orders'>> {
  const existingOrder = await ctx.db
    .query('orders')
    .withIndex('checkoutId', (q) => q.eq('checkoutId', data.checkoutId))
    .first();

  if (existingOrder) {
    await ctx.db.patch(existingOrder._id, {
      status: data.status,
      email: data.email,
      completedAt: data.status === 'succeeded' ? Date.now() : undefined,
      amount: data.amount,
      discountAmount: data.discountAmount,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount || data.amount,
      currency: data.currency,
      customerName: data.customerName,
      customerIpAddress: data.customerIpAddress,
      isBusinessCustomer: data.isBusinessCustomer,
      customerTaxId: data.customerTaxId,
      billingAddress: data.billingAddress,
      discountId: data.discountId,
      discountCode: data.discountCode,
      trialInterval: data.trialInterval,
      trialIntervalCount: data.trialIntervalCount,
      trialEnd: data.trialEnd,
      subscriptionId: data.subscriptionId,
      metadata: data.metadata,
      customFieldData: data.customFieldData,
    });
    return existingOrder._id;
  }

  return await ctx.db.insert('orders', {
    checkoutId: data.checkoutId,
    userId: data.userId,
    customerId: data.customerId,
    email: data.email,
    products: data.products,
    status: data.status,
    completedAt: data.status === 'succeeded' ? Date.now() : undefined,
    amount: data.amount,
    discountAmount: data.discountAmount,
    taxAmount: data.taxAmount,
    totalAmount: data.totalAmount || data.amount,
    currency: data.currency,
    customerName: data.customerName,
    customerIpAddress: data.customerIpAddress,
    isBusinessCustomer: data.isBusinessCustomer,
    customerTaxId: data.customerTaxId,
    billingAddress: data.billingAddress,
    discountId: data.discountId,
    discountCode: data.discountCode,
    trialInterval: data.trialInterval,
    trialIntervalCount: data.trialIntervalCount,
    trialEnd: data.trialEnd,
    subscriptionId: data.subscriptionId,
    metadata: data.metadata,
    customFieldData: data.customFieldData,
    createdAt: Date.now(),
  });
}

export async function updateCartCheckout(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
  checkoutData: {
    checkoutId: string;
    checkoutUrl: string;
    discountId?: string;
    discountCode?: string;
    customFieldData?: Record<string, string | number | boolean | null>;
  },
): Promise<void> {
  const updateData: {
    lastCheckoutId: string;
    lastCheckoutUrl: string;
    updatedAt: number;
    discountId?: string;
    discountCode?: string;
    customFieldData?: Record<string, string | number | boolean | null>;
  } = {
    lastCheckoutId: checkoutData.checkoutId,
    lastCheckoutUrl: checkoutData.checkoutUrl,
    updatedAt: Date.now(),
  };

  if (checkoutData.discountId) { updateData.discountId = checkoutData.discountId; }
  if (checkoutData.discountCode) { updateData.discountCode = checkoutData.discountCode; }
  if (checkoutData.customFieldData) { updateData.customFieldData = checkoutData.customFieldData; }

  await ctx.db.patch(cartId, updateData);
}

export async function getUserOrders(
  ctx: MutationCtx,
  userId: string,
  userEmail?: string,
): Promise<Doc<'orders'>[]> {
  const orders: Doc<'orders'>[] = [];

  const userOrders = await ctx.db
    .query('orders')
    .withIndex('userId', (q) => q.eq('userId', userId))
    .order('desc')
    .collect();
  orders.push(...userOrders);

  if (userEmail) {
    const guestOrders = await ctx.db
      .query('orders')
      .withIndex('email', (q) => q.eq('email', userEmail))
      .filter((q) => q.eq(q.field('userId'), undefined))
      .order('desc')
      .collect();
    orders.push(...guestOrders);
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function batchFetchPolarProducts(
  ctx: ActionCtx,
  cartItems: Array<{
    product: {
      polarProductId?: string;
      name: string;
    };
    quantity: number;
    price: number;
  }>,
): Promise<CartItemForCheckout[]> {
  for (const item of cartItems) {
    if (!item.product.polarProductId) {
      throw new Error(
        `Product "${item.product.name}" is not available for checkout`,
      );
    }
  }

  const polarProductPromises = cartItems.map(async (item) => {
    const polarProductId = item.product.polarProductId;
    if (!polarProductId) {
      throw new Error(
        `Product "${item.product.name}" is not available for checkout`,
      );
    }

    const polarProduct = await ctx.runQuery(components.polar.lib.getProduct, {
      id: polarProductId,
    });

    if (!polarProduct) {
      throw new Error(`Polar product not found for "${item.product.name}"`);
    }

    const activePrice = polarProduct.prices.find(
      (p: (typeof polarProduct.prices)[number]) => !p.isArchived,
    );

    return {
      polarProductId,
      polarPriceId: activePrice?.id || null,
      quantity: item.quantity,
      name: item.product.name,
      price: item.price,
    };
  });

  return await Promise.all(polarProductPromises);
}
