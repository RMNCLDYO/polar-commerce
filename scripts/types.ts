/**
 * Shared type definitions for seeding scripts
 * Ensures type safety and consistency across all seeding operations
 */

export interface PolarProduct {
  id: string;
  name: string;
  description?: string | null;
  isArchived?: boolean;
  is_archived?: boolean;
  isRecurring?: boolean;
  medias?: Array<{ id: string; publicUrl?: string }>;
}

export interface ProductsListResponse {
  result?: {
    items?: PolarProduct[];
  };
}

export interface PageIteratorResponse {
  ok: boolean;
  value?: ProductsListResponse;
}

export interface PolarFile {
  id: string;
  publicUrl?: string;
}

export interface ConvexProduct {
  _id: string;
  name: string;
  polarProductId?: string | null;
  polarImageUrl?: string | null;
  category: string;
}

export interface Product {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  inStock: boolean;
  inventory_qty: number;
}

export interface ProductPlan {
  name: string;
  description: string;
  priceAmount: number;
  recurringInterval: 'month' | 'year';
  tierName: string;
  tierLevel: string;
}

export interface SubscriptionData {
  id: string;
  name: string;
  description: string;
  tier: string;
  pricing: {
    monthly: { amount: number };
    yearly: { amount: number; savings?: string };
  };
}

export interface CatalogProduct {
  _id: string;
  polarProductId?: string | null;
  category: string;
  name: string;
  polarImageUrl?: string | null;
  imageUrl?: string | null;
}

export interface PolarConvexProduct {
  id: string;
  medias?: Array<{ publicUrl?: string }>;
}

export interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string[];
}

export interface ProcessedProduct {
  name: string;
  polarId: string;
  convexId: string;
}

export interface CreatedSubscription {
  name: string;
  id: string;
  price: string;
  tier: string;
}
