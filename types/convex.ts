import type { Id } from '@/convex/_generated/dataModel';
import type { CheckoutCustomFieldData, ProductMetadata, CheckoutMetadata } from '@/convex/types/metadata';

export interface AuthUser {
  _id: string;
  _creationTime: number;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  username?: string;
  foo?: string;
}

export interface AuthSession {
  _id: string;
  _creationTime: number;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthAccount {
  _id: string;
  _creationTime: number;
  userId: string;
  providerId: string;
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface CurrentUser extends AuthUser {
  subscription?: PolarSubscription | null;
  tier: 'free' | 'starter' | 'premium';
  isFree: boolean;
  isStarter: boolean;
  isPremium: boolean;
}

export interface PolarProduct {
  id: string;
  name: string;
  description?: string;
  prices: PolarPrice[];
  benefits: string[];
  isArchived: boolean;
  medias: Array<{
    id: string;
    url: string;
  }>;
  organization_id: string;
  created_at: string;
  modified_at?: string;
}

export interface PolarPrice {
  id: string;
  amount_type: 'fixed' | 'custom' | 'free';
  price_amount: number;
  price_currency: string;
  type: 'one_time' | 'recurring';
  recurring_interval?: 'month' | 'year';
}

export interface PolarSubscription {
  id: string;
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  started_at?: string;
  ended_at?: string;
  user_id: string;
  product_id: string;
  price_id: string;
  customer_id: string;
  productKey?: string;
}

export interface PolarCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
  created_at: string;
  modified_at?: string;
  organization_id: string;
}

export interface PolarCheckout {
  id: string;
  url: string;
  customer_email?: string;
  customer_name?: string;
  product_id: string;
  product_price_id: string;
  discount_id?: string;
  allow_discount_codes?: boolean;
  metadata?: Record<string, string>;
  success_url?: string;
}

export interface PolarOrder {
  id: string;
  created_at: string;
  amount: number;
  tax_amount: number;
  currency: string;
  customer_id: string;
  product_id: string;
  product_price_id: string;
  discount_id?: string;
  subscription_id?: string;
  user_id?: string;
  metadata?: Record<string, string>;
}

export interface PolarComponentProduct {
  _id: string;
  _creationTime: number;
  id: string;
  name: string;
  description?: string;
  isArchived: boolean;
  prices: PolarPrice[];
  organizationId: string;
}

export interface PolarComponentCustomer {
  _id: string;
  _creationTime: number;
  id: string;
  email: string;
  name?: string;
  userId: string;
  organizationId: string;
}

export interface PolarComponentSubscription {
  _id: string;
  _creationTime: number;
  id: string;
  customerId: string;
  productId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd?: string;
  endedAt?: string;
  userId: string;
}

export interface PolarProductsResponse {
  starterMonthly?: PolarComponentProduct;
  starterYearly?: PolarComponentProduct;
  premiumMonthly?: PolarComponentProduct;
  premiumYearly?: PolarComponentProduct;
}

export interface CheckoutSessionResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export interface Cart {
  _id: Id<'carts'>;
  _creationTime: number;
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
  _id: Id<'cartItems'>;
  _creationTime: number;
  cartId: Id<'carts'>;
  catalogId: Id<'catalog'>;
  quantity: number;
  price: number;
  addedAt: number;
  updatedAt: number;
}

export interface CartWithItems extends Cart {
  items: Array<CartItem & {
    product: CatalogProduct;
  }>;
  itemCount: number;
  subtotal: number;
}

export interface CartValidation {
  valid: boolean;
  errors: string[];
  outOfStockItems: string[];
  modifiedPrices: Array<{
    productName: string;
    oldPrice: number;
    newPrice: number;
  }>;
}

export interface CatalogProduct {
  _id: Id<'catalog'>;
  _creationTime: number;
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
  tags?: string[];
  slug: string;
  sku?: string;
  metadata?: ProductMetadata;
}

export interface ProductImage {
  imageUrl: string;
  polarImageUrl?: string;
  polarImageId?: string;
}

export interface Wishlist {
  _id: Id<'wishlists'>;
  _creationTime: number;
  userId?: string;
  sessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WishlistItem {
  _id: Id<'wishlistItems'>;
  _creationTime: number;
  wishlistId: Id<'wishlists'>;
  catalogId: Id<'catalog'>;
  notes?: string;
  createdAt: number;
}

export interface WishlistWithItems extends Wishlist {
  items: Array<WishlistItem & {
    product: CatalogProduct;
  }>;
  itemCount: number;
}

export interface Order {
  _id: Id<'orders'>;
  _creationTime: number;
  userId?: string;
  sessionId?: string;
  polarOrderId: string;
  polarCheckoutId: string;
  cartId?: Id<'carts'>;
  items: Array<{
    catalogId: Id<'catalog'>;
    productName: string;
    price: number;
    quantity: number;
    polarProductId?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: CheckoutMetadata;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  fulfilledAt?: number;
  canceledAt?: number;
}

export interface DemoTodo {
  _id: Id<'demoTodos'>;
  _creationTime: number;
  text: string;
  isCompleted: boolean;
  userId?: string;
  sessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BetterAuthUser {
  _id: string;
  _creationTime: number;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
  banned?: boolean;
  banReason?: string;
  banExpiresAt?: string;
}

export interface BetterAuthSession {
  _id: string;
  _creationTime: number;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  activeOrganizationId?: string;
  impersonatedBy?: string;
}

export interface BetterAuthVerification {
  _id: string;
  _creationTime: number;
  identifier: string;
  value: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BetterAuthTwoFactor {
  _id: string;
  _creationTime: number;
  userId: string;
  secret: string;
  backupCodes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface MutationResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export type GetCurrentUserResponse = CurrentUser | null;
export type GetCurrentUserBasicResponse = AuthUser | null;
export type GetCartResponse = CartWithItems | null | undefined;
export type GetWishlistResponse = WishlistWithItems | null | undefined;
export type GetCatalogResponse = CatalogProduct[];
export type GetProductResponse = CatalogProduct | null;
export type GetOrdersResponse = Order[];
export type GetDemoTodosResponse = DemoTodo[];

export interface AddToCartResponse {
  success: boolean;
  cartItem?: CartItem;
  error?: string;
}

export interface RemoveFromCartResponse {
  success: boolean;
  error?: string;
}

export interface CreateCheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
}

export interface ToggleWishlistResponse {
  action: 'added' | 'removed';
  item?: WishlistItem;
}

export type ConvexQueryResult<T> = T | null | undefined;
export type ConvexMutationResult<T> = Promise<T>;
export type ConvexActionResult<T> = Promise<T>;

export function isAuthUser(obj: unknown): obj is AuthUser {
  return obj !== null &&
    typeof obj === 'object' &&
    '_id' in obj &&
    'email' in obj;
}

export function isCurrentUser(obj: unknown): obj is CurrentUser {
  return isAuthUser(obj) &&
    'tier' in obj &&
    'isFree' in obj &&
    'isStarter' in obj &&
    'isPremium' in obj;
}

export function isPolarProduct(obj: unknown): obj is PolarProduct {
  return obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'prices' in obj;
}

export function isCart(obj: unknown): obj is CartWithItems {
  return obj !== null &&
    typeof obj === 'object' &&
    '_id' in obj &&
    'items' in obj &&
    'subtotal' in obj;
}

export function isWishlist(obj: unknown): obj is WishlistWithItems {
  return obj !== null &&
    typeof obj === 'object' &&
    '_id' in obj &&
    'items' in obj &&
    Array.isArray((obj as WishlistWithItems).items);
}