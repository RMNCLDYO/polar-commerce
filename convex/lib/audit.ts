/**
 * Audit Logging System
 *
 * Logs sensitive operations for security compliance and debugging
 * Tracks who did what, when, and from where
 */

import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';
import type { MutationCtx } from '../_generated/server';
import { logger } from '../utils/logger';

/**
 * Audit event types
 */
export type AuditEventType =
  | 'checkout.created'
  | 'checkout.completed'
  | 'checkout.failed'
  | 'order.created'
  | 'order.refunded'
  | 'cart.cleared'
  | 'cart.merged'
  | 'inventory.decremented'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'admin.action';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  timestamp: number;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  _ctx: MutationCtx,
  entry: Omit<AuditLogEntry, 'timestamp'>,
): Promise<void> {
  // Log to console for immediate visibility
  const level = entry.success ? 'info' : 'warn';
  logger[level](`[Audit] ${entry.eventType}: ${entry.action}`, {
    userId: entry.userId,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    success: entry.success,
    ...entry.details,
  });

  // Optional: Store in database for long-term auditing
  // Uncomment this if you add an 'auditLogs' table to your schema
  // const auditEntry: AuditLogEntry = {
  //   ...entry,
  //   timestamp: Date.now(),
  // };
  // await ctx.db.insert('auditLogs', auditEntry);
}

/**
 * Track checkout creation
 */
export async function auditCheckoutCreated(
  ctx: MutationCtx,
  checkoutId: string,
  userId?: string,
  sessionId?: string,
  amount?: number,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType: 'checkout.created',
    userId,
    sessionId,
    ipAddress,
    resourceType: 'checkout',
    resourceId: checkoutId,
    action: 'Created checkout session',
    details: {
      amount,
      currency: 'usd',
    },
    success: true,
  });
}

/**
 * Track checkout completion
 */
export async function auditCheckoutCompleted(
  ctx: MutationCtx,
  checkoutId: string,
  userId?: string,
  amount?: number,
  products?: Array<{ id: string; name: string; quantity: number }>,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType: 'checkout.completed',
    userId,
    resourceType: 'checkout',
    resourceId: checkoutId,
    action: 'Completed checkout',
    details: {
      amount,
      productCount: products?.length || 0,
      products: products?.map((p) => `${p.name} (${p.quantity})`).join(', '),
    },
    success: true,
  });
}

/**
 * Track order creation
 */
export async function auditOrderCreated(
  ctx: MutationCtx,
  orderId: string,
  userId?: string,
  amount?: number,
  customerEmail?: string,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType: 'order.created',
    userId,
    resourceType: 'order',
    resourceId: orderId,
    action: 'Created order',
    details: {
      amount,
      customerEmail,
    },
    success: true,
  });
}

/**
 * Track cart clearing (important for audit trail)
 */
export async function auditCartCleared(
  ctx: MutationCtx,
  cartId: string,
  userId?: string,
  sessionId?: string,
  itemCount?: number,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType: 'cart.cleared',
    userId,
    sessionId,
    resourceType: 'cart',
    resourceId: cartId,
    action: 'Cleared cart',
    details: {
      itemCount,
    },
    success: true,
  });
}

/**
 * Track cart merging (guest to user)
 */
export async function auditCartMerged(
  ctx: MutationCtx,
  fromCartId: string,
  toCartId: string,
  userId?: string,
  sessionId?: string,
  itemCount?: number,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType: 'cart.merged',
    userId,
    sessionId,
    resourceType: 'cart',
    resourceId: toCartId,
    action: 'Merged guest cart to user cart',
    details: {
      fromCartId,
      toCartId,
      itemCount,
    },
    success: true,
  });
}

/**
 * Track inventory decrementation
 */
export async function auditInventoryDecremented(
  ctx: MutationCtx,
  productId: string,
  quantity: number,
  checkoutId?: string,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType: 'inventory.decremented',
    resourceType: 'product',
    resourceId: productId,
    action: 'Decremented inventory',
    details: {
      quantity,
      checkoutId,
    },
    success: true,
  });
}

/**
 * Track failed operations for security monitoring
 */
export async function auditOperationFailed(
  ctx: MutationCtx,
  eventType: AuditEventType,
  action: string,
  errorMessage: string,
  userId?: string,
  sessionId?: string,
  ipAddress?: string,
  resourceType?: string,
  resourceId?: string,
): Promise<void> {
  await logAuditEvent(ctx, {
    eventType,
    userId,
    sessionId,
    ipAddress,
    resourceType,
    resourceId,
    action,
    success: false,
    errorMessage,
  });
}

/**
 * Internal mutation for logging audit events
 * Can be called from actions
 */
export const logEvent = internalMutation({
  args: {
    eventType: v.string(),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    action: v.string(),
    details: v.optional(v.record(v.string(), v.any())),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await logAuditEvent(ctx, {
      eventType: args.eventType as AuditEventType,
      userId: args.userId,
      sessionId: args.sessionId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      action: args.action,
      details: args.details,
      success: args.success,
      errorMessage: args.errorMessage,
    });
  },
});
