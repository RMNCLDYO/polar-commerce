/**
 * Comprehensive types for Polar Checkout API integration
 * Based on Polar's official API specification
 */

import { v } from 'convex/values';

export type TrialInterval = 'day' | 'week' | 'month' | 'year';

export type CountryAlpha2 =
  | 'US'
  | 'CA'
  | 'GB'
  | 'DE'
  | 'FR'
  | 'ES'
  | 'IT'
  | 'NL'
  | 'SE'
  | 'NO'
  | 'DK'
  | 'FI'
  | string;

/**
 * Address structure matching Polar's AddressInput schema
 */
export interface Address {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country: CountryAlpha2;
}

/**
 * Metadata constraints per Polar specification:
 * - Key: max 40 chars
 * - Value: string (max 500 chars), integer, number, or boolean
 * - Max 50 key-value pairs
 */
export type Metadata = Record<string, string | number | boolean>;

/**
 * Custom field data for checkout forms
 */
export type CustomFieldData = Record<
  string,
  string | number | boolean | Date | null
>;

/**
 * Comprehensive checkout session options
 * Implements all features from Polar's CheckoutProductsCreate schema
 */
export interface CheckoutSessionOptions {
  // ============================================
  // REQUIRED FIELDS
  // ============================================

  /**
   * List of product IDs available to select at checkout
   * The first one will be selected by default
   */
  products: string[];

  /**
   * URL where the customer will be redirected after successful payment
   * Can include `checkout_id={CHECKOUT_ID}` query parameter
   */
  successUrl: string;

  // ============================================
  // CUSTOMER IDENTIFICATION
  // ============================================

  /**
   * ID of an existing customer in the organization
   * Pre-fills checkout form and links the resulting order
   */
  customerId?: string;

  /**
   * ID of the customer in your system
   * If matching customer exists on Polar, order will be linked
   * Otherwise, new customer created with this external ID
   */
  externalCustomerId?: string;

  /**
   * Email address of the customer
   * Pre-fills checkout form
   */
  customerEmail?: string;

  /**
   * Name of the customer
   * Pre-fills checkout form
   */
  customerName?: string;

  /**
   * IP address of the customer
   * Used for fraud prevention and tax calculation
   */
  customerIpAddress?: string;

  // ============================================
  // CUSTOMER TYPE & BILLING
  // ============================================

  /**
   * Whether the customer is a business or individual
   * If true, requires full billing address and billing name
   * @default false
   */
  isBusinessCustomer?: boolean;

  /**
   * Billing name of the customer
   * Required for business customers
   */
  customerBillingName?: string;

  /**
   * Billing address of the customer
   * Pre-fills checkout form
   */
  customerBillingAddress?: Address;

  /**
   * Tax ID of the customer
   * For VAT, GST, etc.
   */
  customerTaxId?: string;

  /**
   * Whether to require full billing address
   * US customers always required regardless of this setting
   * Auto-set to true if billing address is preset
   * @default false
   */
  requireBillingAddress?: boolean;

  // ============================================
  // METADATA
  // ============================================

  /**
   * Key-value object for additional information
   * Copied to the resulting order and/or subscription
   * If subscription_id is set, this will overwrite existing keys
   */
  metadata?: Metadata;

  /**
   * Key-value object copied to the created customer
   * Separate from checkout metadata
   */
  customerMetadata?: Metadata;

  // ============================================
  // PRICING & DISCOUNTS
  // ============================================

  /**
   * Amount in cents, before discounts and taxes
   * Only useful for custom prices, ignored for fixed/free prices
   * Min: 50, Max: 99999999
   */
  amount?: number;

  /**
   * ID of the discount to apply to the checkout
   */
  discountId?: string;

  /**
   * Whether to allow customers to apply discount codes
   * Even if you apply a discount via discountId, it'll still be applied
   * but customer won't be able to change it
   * @default true
   */
  allowDiscountCodes?: boolean;

  // ============================================
  // CUSTOM FIELDS
  // ============================================

  /**
   * Key-value object storing custom field values
   * For collecting additional information at checkout
   */
  customFieldData?: CustomFieldData;

  // ============================================
  // TRIAL PERIODS
  // ============================================

  /**
   * The interval unit for the trial period
   */
  trialInterval?: TrialInterval;

  /**
   * The number of interval units for the trial period
   * Min: 1, Max: 1000
   */
  trialIntervalCount?: number;

  // ============================================
  // SUBSCRIPTION UPGRADE
  // ============================================

  /**
   * ID of a subscription to upgrade
   * Must be on a free pricing
   * On successful checkout, metadata will be copied to the subscription
   * and existing keys will be overwritten
   */
  subscriptionId?: string;

  // ============================================
  // EMBEDDING & UX
  // ============================================

  /**
   * If embedding the checkout, set this to the Origin of the embedding page
   * Allows the Polar iframe to communicate with the parent page
   */
  embedOrigin?: string;
}

/**
 * Cart item structure for internal tracking
 */
export interface CartItemForCheckout {
  polarProductId: string;
  polarPriceId: string | null;
  quantity: number;
  name: string;
  price: number;
}

/**
 * Response from createCheckoutSession
 */
export interface CheckoutSessionResponse {
  success: boolean;
  checkoutId: string;
  checkoutUrl: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  expiresAt: string;
}

/**
 * Billing address field configuration
 */
export type BillingAddressFieldMode = 'required' | 'optional' | 'disabled';

export interface CheckoutBillingAddressFields {
  country: BillingAddressFieldMode;
  state: BillingAddressFieldMode;
  city: BillingAddressFieldMode;
  postal_code: BillingAddressFieldMode;
  line1: BillingAddressFieldMode;
  line2: BillingAddressFieldMode;
}

/**
 * Checkout status values
 */
export type CheckoutStatus =
  | 'open'
  | 'expired'
  | 'confirmed'
  | 'succeeded'
  | 'failed';

/**
 * Full checkout session data (from Polar API)
 */
export interface CheckoutSession {
  id: string;
  created_at: string;
  modified_at: string | null;
  payment_processor: 'stripe';
  status: CheckoutStatus;
  client_secret: string;
  url: string;
  expires_at: string;
  success_url: string;
  embed_origin: string | null;

  // Amounts
  amount: number;
  discount_amount: number;
  net_amount: number;
  tax_amount: number | null;
  total_amount: number;
  currency: string;

  // Trial info
  active_trial_interval: TrialInterval | null;
  active_trial_interval_count: number | null;
  trial_end: string | null;

  // Product info
  product_id: string;
  product_price_id: string;

  // Discount info
  discount_id: string | null;
  allow_discount_codes: boolean;

  // Customer info
  customer_id: string | null;
  is_business_customer: boolean;
  customer_name: string | null;
  customer_email: string | null;
  customer_ip_address: string | null;
  customer_billing_name: string | null;
  customer_billing_address: Address | null;
  customer_tax_id: string | null;

  // Flags
  require_billing_address: boolean;
  is_discount_applicable: boolean;
  is_free_product_price: boolean;
  is_payment_required: boolean;
  is_payment_setup_required: boolean;
  is_payment_form_required: boolean;

  // Configuration
  billing_address_fields: CheckoutBillingAddressFields;

  // Metadata
  metadata: Metadata;
  custom_field_data: CustomFieldData;
  customer_metadata: Metadata;

  // Subscription
  subscription_id: string | null;

  // Legacy
  external_customer_id: string | null;
  customer_external_id: string | null;
}

// Convex validators for return values
export const vCheckoutSessionResponse = v.object({
  success: v.boolean(),
  checkoutId: v.string(),
  checkoutUrl: v.string(),
  clientSecret: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: v.string(),
  expiresAt: v.string(),
});

export const vCheckoutSuccessResponse = v.object({
  success: v.boolean(),
  status: v.string(),
  orderId: v.string(),
});
