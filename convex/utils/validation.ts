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
