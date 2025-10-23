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

export interface Address {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country: CountryAlpha2;
}

export type Metadata = Record<string, string | number | boolean>;

export type CustomFieldData = Record<
  string,
  string | number | boolean | Date | null
>;

export interface CheckoutSessionOptions {
  products: string[];
  successUrl: string;
  customerId?: string;
  externalCustomerId?: string;
  customerEmail?: string;
  customerName?: string;
  customerIpAddress?: string;
  isBusinessCustomer?: boolean;
  customerBillingName?: string;
  customerBillingAddress?: Address;
  customerTaxId?: string;
  requireBillingAddress?: boolean;
  metadata?: Metadata;
  customerMetadata?: Metadata;
  amount?: number;
  discountId?: string;
  allowDiscountCodes?: boolean;
  customFieldData?: CustomFieldData;
  trialInterval?: TrialInterval;
  trialIntervalCount?: number;
  subscriptionId?: string;
  embedOrigin?: string;
}

export interface CartItemForCheckout {
  polarProductId: string;
  polarPriceId: string | null;
  quantity: number;
  name: string;
  price: number;
}

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

export type BillingAddressFieldMode = 'required' | 'optional' | 'disabled';

export interface CheckoutBillingAddressFields {
  country: BillingAddressFieldMode;
  state: BillingAddressFieldMode;
  city: BillingAddressFieldMode;
  postal_code: BillingAddressFieldMode;
  line1: BillingAddressFieldMode;
  line2: BillingAddressFieldMode;
}

export type CheckoutStatus =
  | 'open'
  | 'expired'
  | 'confirmed'
  | 'succeeded'
  | 'failed';

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
  amount: number;
  discount_amount: number;
  net_amount: number;
  tax_amount: number | null;
  total_amount: number;
  currency: string;
  active_trial_interval: TrialInterval | null;
  active_trial_interval_count: number | null;
  trial_end: string | null;
  product_id: string;
  product_price_id: string;
  discount_id: string | null;
  allow_discount_codes: boolean;
  customer_id: string | null;
  is_business_customer: boolean;
  customer_name: string | null;
  customer_email: string | null;
  customer_ip_address: string | null;
  customer_billing_name: string | null;
  customer_billing_address: Address | null;
  customer_tax_id: string | null;
  require_billing_address: boolean;
  is_discount_applicable: boolean;
  is_free_product_price: boolean;
  is_payment_required: boolean;
  is_payment_setup_required: boolean;
  is_payment_form_required: boolean;
  billing_address_fields: CheckoutBillingAddressFields;
  metadata: Metadata;
  custom_field_data: CustomFieldData;
  customer_metadata: Metadata;
  subscription_id: string | null;
  external_customer_id: string | null;
  customer_external_id: string | null;
}

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
