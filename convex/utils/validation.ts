import { v } from 'convex/values';
import { partial } from 'convex-helpers/validators';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateQuantity(
  requested: number,
  available: number,
  productName: string,
): void {
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new ValidationError('Quantity must be a positive integer');
  }

  if (!Number.isInteger(available) || available < 0) {
    throw new ValidationError(`Invalid inventory for ${productName}`);
  }

  if (requested > available) {
    throw new ValidationError(
      `Only ${available} ${available === 1 ? 'item' : 'items'} available in stock`,
    );
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePrice(price: number, productName: string): void {
  if (!Number.isFinite(price) || price < 0) {
    throw new ValidationError(`Invalid price for ${productName}: ${price}`);
  }
}

export function validateNonEmptyString(
  value: string | undefined | null,
  fieldName: string,
): asserts value is string {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
}

const vAddressBase = v.object({
  line1: v.string(),
  line2: v.string(),
  postal_code: v.string(),
  city: v.string(),
  state: v.string(),
  country: v.string(),
});

export const vAddress = v.object({
  line1: v.optional(v.string()),
  line2: v.optional(v.string()),
  postal_code: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  country: v.string(),
});

export const vAddressPartial = partial(vAddressBase);

export const vPositiveInteger = v.number();

export const vPrice = v.number();

export const vEmail = v.string();

export const vUrl = v.string();

// Safer metadata type - allows only JSON-serializable primitives
const vMetadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null()
);

export const vCheckoutMetadata = v.record(v.string(), vMetadataValue);

export const vCustomFieldData = v.record(v.string(), vMetadataValue);

export const vProductInfo = v.object({
  id: v.string(),
  name: v.string(),
  quantity: v.number(),
  price: v.number(),
});

export const vTrialInterval = v.union(
  v.literal('day'),
  v.literal('week'),
  v.literal('month'),
  v.literal('year'),
);

export const vCheckoutStatus = v.union(
  v.literal('confirmed'),
  v.literal('succeeded'),
  v.literal('failed'),
  v.literal('pending'),
  v.literal('expired'),
);

export const vOrderStatus = v.union(
  v.literal('succeeded'),
  v.literal('failed'),
  v.literal('pending'),
  v.literal('confirmed'),
  v.literal('expired'),
);

export const vCurrency = v.union(v.literal('usd'), v.literal('eur'));

export const vSortOption = v.union(
  v.literal('price-asc'),
  v.literal('price-desc'),
  v.literal('name-asc'),
  v.literal('name-desc'),
  v.literal('newest'),
);

export const vSuccessResponse = v.object({
  success: v.boolean(),
});

export const vCartItemWithProduct = v.object({
  _id: v.id('cartItems'),
  _creationTime: v.number(),
  cartId: v.id('carts'),
  catalogId: v.id('catalog'),
  quantity: v.number(),
  price: v.number(),
  addedAt: v.number(),
  updatedAt: v.number(),
  product: v.object({
    _id: v.id('catalog'),
    _creationTime: v.number(),
    name: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    polarImageUrl: v.optional(v.string()),
    polarImageId: v.optional(v.string()),
    description: v.string(),
    polarProductId: v.optional(v.string()),
    isActive: v.boolean(),
    inStock: v.boolean(),
    inventory_qty: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});

export const vCartResponse = v.object({
  id: v.id('carts'),
  items: v.array(vCartItemWithProduct),
  subtotal: v.number(),
  itemCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const vProductListItem = v.object({
  id: v.id('catalog'),
  name: v.string(),
  price: v.string(),
  category: v.string(),
  image: v.string(),
  description: v.string(),
  polarProductId: v.optional(v.string()),
  inStock: v.boolean(),
  inventory_qty: v.number(),
});

export const vCartValidationResponse = v.object({
  valid: v.boolean(),
  errors: v.array(v.string()),
  itemCount: v.optional(v.number()),
});

export const vWishlistItemWithProduct = v.object({
  _id: v.id('wishlistItems'),
  catalogId: v.id('catalog'),
  addedAt: v.number(),
  notes: v.optional(v.string()),
  product: v.object({
    _id: v.id('catalog'),
    _creationTime: v.number(),
    name: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    polarImageUrl: v.optional(v.string()),
    polarImageId: v.optional(v.string()),
    description: v.string(),
    polarProductId: v.optional(v.string()),
    isActive: v.boolean(),
    inStock: v.boolean(),
    inventory_qty: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});

export const vWishlistResponse = v.object({
  id: v.id('wishlists'),
  items: v.array(vWishlistItemWithProduct),
  itemCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const vToggleWishlistResponse = v.object({
  success: v.boolean(),
  action: v.union(v.literal('added'), v.literal('removed')),
});

export const vCartDoc = v.union(
  v.object({
    _id: v.id('carts'),
    _creationTime: v.number(),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    lastCheckoutId: v.optional(v.string()),
    lastCheckoutUrl: v.optional(v.string()),
    discountId: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    customFieldData: v.optional(v.record(v.string(), v.any())),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  }),
  v.null(),
);

export const vAuthUser = v.union(
  v.object({
    email: v.string(),
    name: v.optional(v.string()),
  }),
  v.null(),
);

export const vInventoryUpdateResponse = v.object({
  success: v.boolean(),
  newInventory: v.number(),
  inStock: v.boolean(),
});

export const vLinkOrdersResponse = v.object({
  success: v.boolean(),
  linkedOrders: v.number(),
});

export const vProductUpdate = partial(
  v.object({
    name: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    polarImageUrl: v.string(),
    polarImageId: v.string(),
    description: v.string(),
    polarProductId: v.string(),
    isActive: v.boolean(),
    inStock: v.boolean(),
    inventory_qty: v.number(),
  }),
);

export const vCatalogProduct = v.object({
  _id: v.id('catalog'),
  _creationTime: v.number(),
  name: v.string(),
  price: v.number(),
  category: v.string(),
  imageUrl: v.string(),
  polarImageUrl: v.optional(v.string()),
  polarImageId: v.optional(v.string()),
  description: v.string(),
  polarProductId: v.optional(v.string()),
  isActive: v.boolean(),
  inStock: v.boolean(),
  inventory_qty: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const vBetterAuthUser = v.object({
  _id: v.string(),
  _creationTime: v.number(),
  email: v.string(),
  emailVerified: v.boolean(),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const vCurrentUser = v.union(vBetterAuthUser, v.null());

export const vPolarProduct = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  isArchived: v.optional(v.boolean()),
  organizationId: v.optional(v.string()),
  prices: v.array(v.any()),
  benefits: v.optional(v.array(v.any())),
  medias: v.optional(v.array(v.any())),
});

export const vPolarCheckout = v.union(
  v.object({
    id: v.string(),
    status: vCheckoutStatus,
    url: v.string(),
    clientSecret: v.string(),
    amount: v.number(),
    taxAmount: v.optional(v.number()),
    totalAmount: v.number(),
    currency: v.string(),
    expiresAt: v.string(),
    customerId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  }),
  v.null(),
);

export const vInspectDataResponse = v.record(v.string(), v.number());

export const vSubscriptionProducts = v.record(
  v.string(),
  v.object({
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  }),
);

export const vSyncResult = v.object({
  convexId: v.id('catalog'),
  name: v.string(),
  status: v.union(
    v.literal('already_linked'),
    v.literal('found_existing'),
    v.literal('created_new'),
  ),
  polarProductId: v.string(),
});

export const vUserSyncResult = v.object({
  success: v.boolean(),
  userId: v.string(),
  customerId: v.string(),
  source: v.string(),
});

export const vMessageResponse = v.object({
  message: v.string(),
});
