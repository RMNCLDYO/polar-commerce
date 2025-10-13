/**
 * Common type definitions used across the application
 */

import type { CheckoutCustomFieldData } from '@/convex/types/metadata';

// User and Authentication Types
export interface User {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  subscription?: Subscription;
  tier?: 'free' | 'starter' | 'premium';
  isFree?: boolean;
  isStarter?: boolean;
  isPremium?: boolean;
}

export interface Subscription {
  productKey?: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

// Catalog Types
export interface CatalogItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  polarImageUrl?: string;
  polarImageId?: string;
  description: string;
  polarProductId?: string;
  isActive: boolean;
  inStock: boolean;
  inventory_qty: number;
  createdAt: number;
  updatedAt: number;
}

// Cart Types
export interface Cart {
  _id: string;
  userId?: string;
  sessionId?: string;
  lastCheckoutId?: string;
  lastCheckoutUrl?: string;
  discountId?: string;
  discountCode?: string;
  customFieldData?: CheckoutCustomFieldData;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

export interface CartItem {
  _id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: CatalogItem;
  price?: number;
  createdAt: number;
  updatedAt: number;
}

// Order Types
export interface Order {
  _id: string;
  userId?: string;
  polarOrderId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: number;
}

// Polar Types
export interface PolarProduct {
  _id: string;
  polarProductId: string;
  name: string;
  description?: string;
  price: number;
}

export interface PolarCustomer {
  _id: string;
  email: string;
  name?: string;
  polarCustomerId: string;
}

// Context Types
export interface ConvexContext {
  db: unknown;
  auth?: unknown;
  runQuery?: unknown;
  runMutation?: unknown;
  runAction?: unknown;
}