'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Doc } from '@/convex/_generated/dataModel';

const STATUS_VARIANTS = {
  completed: 'default',
  pending: 'secondary',
  processing: 'secondary',
  failed: 'destructive',
  canceled: 'outline',
  refunded: 'outline',
} as const;

const STATUS_LABELS = {
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Processing',
  failed: 'Failed',
  canceled: 'Canceled',
  refunded: 'Refunded',
} as const;

interface RecentOrdersProps {
  orders: Doc<'orders'>[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>You haven&apos;t placed any orders yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Your latest orders and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order: Doc<'orders'>) => {
            const statusVariant =
              STATUS_VARIANTS[order.status as keyof typeof STATUS_VARIANTS] ||
              'outline';
            const statusLabel =
              STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ||
              order.status;

            return (
              <div
                key={order._id}
                className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Order #{order.checkoutId.slice(-8)}
                    </span>
                    <Badge variant={statusVariant} className="text-xs">
                      {statusLabel}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.products.length}{' '}
                    {order.products.length === 1 ? 'item' : 'items'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: order.currency,
                    }).format((order.totalAmount ?? order.amount) / 100)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
