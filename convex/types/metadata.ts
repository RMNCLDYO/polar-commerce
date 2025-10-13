/**
 * Strongly typed metadata schemas for all entities
 * NO MORE Record<string, unknown> laziness!
 */

// ============================================
// Checkout Metadata Schema
// ============================================
export interface CheckoutMetadata {
  cartId?: string;
  cartItems?: string; // JSON stringified cart items
  itemCount?: number;
  sessionId?: string;
  userId?: string;
  email?: string;
  promotionCode?: string;
  referralSource?: string;
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmContent?: string;
  utmTerm?: string;
  bundleProductId?: string;

  // Allow dynamic properties for item data
  // Supports patterns like item_0_id, item_1_quantity, etc.
  [key: string]: string | number | boolean | undefined;
}

// ============================================
// Product Metadata Schema
// ============================================
export interface ProductMetadata {
  sku?: string;
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  tags?: string[];
  featured?: boolean;
  salePercentage?: number;
}

// ============================================
// Customer Metadata Schema
// ============================================
export interface CustomerMetadata {
  preferredLanguage?: string;
  marketingOptIn?: boolean;
  newsletterSubscribed?: boolean;
  loyaltyPoints?: number;
  tierStatus?: 'bronze' | 'silver' | 'gold' | 'platinum';
  dateOfBirth?: string;
  phoneNumber?: string;
  alternateEmail?: string;
  referredBy?: string;
  notes?: string;
}

// ============================================
// Order Metadata Schema
// ============================================
export interface OrderMetadata extends CheckoutMetadata {
  shippingMethod?: 'standard' | 'express' | 'overnight';
  giftMessage?: string;
  giftWrap?: boolean;
  specialInstructions?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDelivery?: string;
}

// ============================================
// Custom Field Data Schema (Checkout)
// ============================================
export interface CheckoutCustomFieldData {
  organizationName?: string;
  taxExemptId?: string;
  purchaseOrderNumber?: string;
  department?: string;
  costCenter?: string;
  projectCode?: string;
  additionalNotes?: string;
  orderNotes?: string;
}

// ============================================
// Country Code Types
// ============================================
export type ISO3166CountryCode =
  | "AD" | "AE" | "AF" | "AG" | "AI" | "AL" | "AM" | "AO" | "AQ" | "AR"
  | "AS" | "AT" | "AU" | "AW" | "AX" | "AZ" | "BA" | "BB" | "BD" | "BE"
  | "BF" | "BG" | "BH" | "BI" | "BJ" | "BL" | "BM" | "BN" | "BO" | "BQ"
  | "BR" | "BS" | "BT" | "BV" | "BW" | "BY" | "BZ" | "CA" | "CC" | "CD"
  | "CF" | "CG" | "CH" | "CI" | "CK" | "CL" | "CM" | "CN" | "CO" | "CR"
  | "CU" | "CV" | "CW" | "CX" | "CY" | "CZ" | "DE" | "DJ" | "DK" | "DM"
  | "DO" | "DZ" | "EC" | "EE" | "EG" | "EH" | "ER" | "ES" | "ET" | "FI"
  | "FJ" | "FK" | "FM" | "FO" | "FR" | "GA" | "GB" | "GD" | "GE" | "GF"
  | "GG" | "GH" | "GI" | "GL" | "GM" | "GN" | "GP" | "GQ" | "GR" | "GS"
  | "GT" | "GU" | "GW" | "GY" | "HK" | "HM" | "HN" | "HR" | "HT" | "HU"
  | "ID" | "IE" | "IL" | "IM" | "IN" | "IO" | "IQ" | "IR" | "IS" | "IT"
  | "JE" | "JM" | "JO" | "JP" | "KE" | "KG" | "KH" | "KI" | "KM" | "KN"
  | "KP" | "KR" | "KW" | "KY" | "KZ" | "LA" | "LB" | "LC" | "LI" | "LK"
  | "LR" | "LS" | "LT" | "LU" | "LV" | "LY" | "MA" | "MC" | "MD" | "ME"
  | "MF" | "MG" | "MH" | "MK" | "ML" | "MM" | "MN" | "MO" | "MP" | "MQ"
  | "MR" | "MS" | "MT" | "MU" | "MV" | "MW" | "MX" | "MY" | "MZ" | "NA"
  | "NC" | "NE" | "NF" | "NG" | "NI" | "NL" | "NO" | "NP" | "NR" | "NU"
  | "NZ" | "OM" | "PA" | "PE" | "PF" | "PG" | "PH" | "PK" | "PL" | "PM"
  | "PN" | "PR" | "PS" | "PT" | "PW" | "PY" | "QA" | "RE" | "RO" | "RS"
  | "RU" | "RW" | "SA" | "SB" | "SC" | "SD" | "SE" | "SG" | "SH" | "SI"
  | "SJ" | "SK" | "SL" | "SM" | "SN" | "SO" | "SR" | "SS" | "ST" | "SV"
  | "SX" | "SY" | "SZ" | "TC" | "TD" | "TF" | "TG" | "TH" | "TJ" | "TK"
  | "TL" | "TM" | "TN" | "TO" | "TR" | "TT" | "TV" | "TW" | "TZ" | "UA"
  | "UG" | "UM" | "US" | "UY" | "UZ" | "VA" | "VC" | "VE" | "VG" | "VI"
  | "VN" | "VU" | "WF" | "WS" | "YE" | "YT" | "ZA" | "ZM" | "ZW";

// Helper to validate and cast country code
export function toCountryCode(country: string): ISO3166CountryCode {
  // Validate it's a valid ISO 3166 code (2-letter uppercase)
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error(`Invalid country code: ${country}`);
  }
  return country as ISO3166CountryCode;
}

export function isValidCountryCode(country: string): country is ISO3166CountryCode {
  return /^[A-Z]{2}$/.test(country);
}

// ============================================
// Type Guards
// ============================================
export function isCheckoutMetadata(obj: unknown): obj is CheckoutMetadata {
  if (typeof obj !== 'object' || obj === null) {return false;}
  const meta = obj as Record<string, unknown>;

  // Validate known fields
  if (meta.cartId !== undefined && typeof meta.cartId !== 'string') {return false;}
  if (meta.itemCount !== undefined && typeof meta.itemCount !== 'number') {return false;}
  if (meta.sessionId !== undefined && typeof meta.sessionId !== 'string') {return false;}
  if (meta.userId !== undefined && typeof meta.userId !== 'string') {return false;}

  return true;
}

export function isProductMetadata(obj: unknown): obj is ProductMetadata {
  if (typeof obj !== 'object' || obj === null) {return false;}
  const meta = obj as Record<string, unknown>;

  if (meta.sku !== undefined && typeof meta.sku !== 'string') {return false;}
  if (meta.featured !== undefined && typeof meta.featured !== 'boolean') {return false;}
  if (meta.salePercentage !== undefined && typeof meta.salePercentage !== 'number') {return false;}

  return true;
}

export function isCustomerMetadata(obj: unknown): obj is CustomerMetadata {
  if (typeof obj !== 'object' || obj === null) {return false;}
  const meta = obj as Record<string, unknown>;

  if (meta.loyaltyPoints !== undefined && typeof meta.loyaltyPoints !== 'number') {return false;}
  if (meta.marketingOptIn !== undefined && typeof meta.marketingOptIn !== 'boolean') {return false;}

  return true;
}