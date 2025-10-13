/**
 * Checkout Model - Business logic for checkout operations
 */

import type { Doc, Id } from '../_generated/dataModel';
import type { ActionCtx, MutationCtx } from '../_generated/server';
import { components } from '../_generated/api';

/**
 * Create an order from checkout data
 */
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
  // Check if order already exists
  const existingOrder = await ctx.db
    .query('orders')
    .withIndex('checkoutId', (q) => q.eq('checkoutId', data.checkoutId))
    .first();

  if (existingOrder) {
    // Update existing order
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

  // Create new order
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

/**
 * Update cart with checkout session info
 */
export async function updateCartCheckout(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
  checkoutData: {
    checkoutId: string;
    checkoutUrl: string;
    discountId?: string;
    discountCode?: string;
    customFieldData?: Record<string, unknown>;
  },
): Promise<void> {
  const updateData: {
    lastCheckoutId: string;
    lastCheckoutUrl: string;
    updatedAt: number;
    discountId?: string;
    discountCode?: string;
    customFieldData?: Record<string, unknown>;
  } = {
    lastCheckoutId: checkoutData.checkoutId,
    lastCheckoutUrl: checkoutData.checkoutUrl,
    updatedAt: Date.now(),
  };

  if (checkoutData.discountId) {updateData.discountId = checkoutData.discountId;}
  if (checkoutData.discountCode)
    {updateData.discountCode = checkoutData.discountCode;}
  if (checkoutData.customFieldData)
    {updateData.customFieldData = checkoutData.customFieldData;}

  await ctx.db.patch(cartId, updateData);
}

/**
 * Get user orders with optional email matching
 */
export async function getUserOrders(
  ctx: MutationCtx,
  userId: string,
  userEmail?: string,
): Promise<Doc<'orders'>[]> {
  const orders: Doc<'orders'>[] = [];

  // Get orders linked to userId
  const userOrders = await ctx.db
    .query('orders')
    .withIndex('userId', (q) => q.eq('userId', userId))
    .order('desc')
    .collect();
  orders.push(...userOrders);

  // Also get any guest orders with the same email that haven't been linked yet
  if (userEmail) {
    const guestOrders = await ctx.db
      .query('orders')
      .withIndex('email', (q) => q.eq('email', userEmail))
      .filter((q) => q.eq(q.field('userId'), undefined))
      .order('desc')
      .collect();
    orders.push(...guestOrders);
  }

  // Sort all orders by creation date
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
