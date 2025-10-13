/**
 * Type definitions for Convex internal components and adapters
 * These types define the shape of responses from Convex components
 */

import type { Id } from '../_generated/dataModel';

// ============================================
// Better Auth Adapter Types
// ============================================

export interface BetterAuthDeleteManyResponse {
  deletedCount: number;
  success: boolean;
}

export interface BetterAuthAdapterInput {
  model: 'user' | 'session' | 'account' | 'verification' | 'twoFactor' | 'jwks';
}

export interface BetterAuthPaginationOpts {
  cursor: string | null;
  numItems: number;
}

export interface BetterAuthDeleteManyArgs {
  input: BetterAuthAdapterInput;
  paginationOpts: BetterAuthPaginationOpts;
}


// ============================================
// Polar Component Internal Types
// ============================================

export interface PolarComponentInternals {
  auth: {
    syncUser: (args: { userId: string; email: string }) => Promise<void>;
    deleteUser: (args: { userId: string }) => Promise<void>;
  };
  polar: {
    createProduct: (args: CreateProductArgs) => Promise<PolarProductResponse>;
    listProducts: () => Promise<PolarProductListResponse>;
    deleteProduct: (args: { id: string }) => Promise<void>;
    deleteCustomer: (args: { userId: string }) => Promise<void>;
    listSubscriptions: (args: { includeEnded?: boolean }) => Promise<PolarSubscriptionListResponse>;
    deleteSubscription: (args: { id: string }) => Promise<void>;
    listCustomers: () => Promise<PolarCustomerListResponse>;
  };
  catalog: {
    list: () => Promise<CatalogItem[]>;
    get: (args: { id: Id<'catalog'> }) => Promise<CatalogItem | null>;
    update: (args: UpdateCatalogArgs) => Promise<void>;
  };
}


// Polar Product Types
export interface CreateProductArgs {
  name: string;
  description?: string;
  prices: Array<{
    amount: number;
    currency: string;
    type: 'one_time' | 'recurring';
    recurring_interval?: 'month' | 'year';
  }>;
}

export interface PolarProductResponse {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  is_archived: boolean;
  created_at: string;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
  }>;
}

export interface PolarProductListResponse {
  items: PolarProductResponse[];
  pagination: {
    max_page: number;
    total_count: number;
  };
}

// Polar Subscription Types
export interface PolarSubscriptionResponse {
  id: string;
  status: string;
  user_id: string;
  product_id: string;
  started_at?: string;
  ended_at?: string;
}

export interface PolarSubscriptionListResponse {
  items: PolarSubscriptionResponse[];
  pagination: {
    max_page: number;
    total_count: number;
  };
}

// Polar Customer Types
export interface PolarCustomerResponse {
  id: string;
  email: string;
  name?: string;
  user_id: string;
  created_at: string;
}

export interface PolarCustomerListResponse {
  items: PolarCustomerResponse[];
  pagination: {
    max_page: number;
    total_count: number;
  };
}

// Catalog Types
export interface CatalogItem {
  _id: Id<'catalog'>;
  _creationTime: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  inStock: boolean;
  inventory_qty: number;
}

export interface UpdateCatalogArgs {
  id: Id<'catalog'>;
  updates: Partial<CatalogItem>;
}

// ============================================
// HTTP Request/Response Types
// ============================================

export interface ConvexHttpRequest {
  body: string | null;
  headers: Record<string, string | string[]>;
  method: string;
  url: string;
}

export interface ConvexHttpResponse {
  status: number;
  body?: string;
  headers?: Record<string, string | string[]>;
}

export interface PolarWebhookBody {
  type: string;
  data: {
    checkout_id?: string;
    order_id?: string;
    customer_id?: string;
    product_id?: string;
    subscription_id?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
  };
}

// Convex function types
export type ConvexFunction<TArgs = Record<string, unknown>, TReturn = unknown> = {
  _args: TArgs;
  _return: TReturn;
};

export interface ConvexActionContext {
  runQuery: <TArgs = Record<string, unknown>, TReturn = unknown>(
    query: ConvexFunction<TArgs, TReturn>,
    args?: TArgs
  ) => Promise<TReturn>;
  runMutation: <TArgs = Record<string, unknown>, TReturn = unknown>(
    mutation: ConvexFunction<TArgs, TReturn>,
    args?: TArgs
  ) => Promise<TReturn>;
  runAction: <TArgs = Record<string, unknown>, TReturn = unknown>(
    action: ConvexFunction<TArgs, TReturn>,
    args?: TArgs
  ) => Promise<TReturn>;
  scheduler: {
    runAfter: <TArgs = Record<string, unknown>>(
      delay: number,
      fn: ConvexFunction<TArgs, void>,
      args?: TArgs
    ) => Promise<void>;
  };
}

// ============================================
// Component Response Types
// ============================================

export interface ComponentListResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ComponentMutationResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export interface ComponentDeleteResponse {
  deletedCount: number;
  success: boolean;
}

// ============================================
// Type Guards
// ============================================

export function isBetterAuthDeleteResponse(
  obj: unknown
): obj is BetterAuthDeleteManyResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'deletedCount' in obj &&
    typeof (obj as Record<string, unknown>).deletedCount === 'number'
  );
}

export function isPolarProductResponse(
  obj: unknown
): obj is PolarProductResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'organization_id' in obj
  );
}

export function isPolarWebhookBody(
  obj: unknown
): obj is PolarWebhookBody {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'type' in obj &&
    'data' in obj &&
    typeof (obj as Record<string, unknown>).type === 'string'
  );
}

export function isConvexHttpRequest(
  obj: unknown
): obj is ConvexHttpRequest {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'body' in obj &&
    'headers' in obj &&
    'method' in obj &&
    'url' in obj
  );
}

// ============================================
// Utility Types for Strict Typing
// ============================================

// Strictly typed component calls
export type TypedComponentCall<TArgs, TReturn> = (
  args: TArgs
) => Promise<TReturn>;

// Strictly typed mutation
export type TypedMutation<TArgs, TReturn> = TypedComponentCall<TArgs, TReturn>;

// Strictly typed query
export type TypedQuery<TArgs, TReturn> = TypedComponentCall<TArgs, TReturn>;

// Strictly typed action
export type TypedAction<TArgs, TReturn> = TypedComponentCall<TArgs, TReturn>;