# Convex Tests

Comprehensive test suite for Convex backend functions.

## Structure

```
convex/tests/
├── setup.ts                      # Test utilities and helpers
├── model/                        # Model layer unit tests
│   ├── cart.test.ts             # Cart business logic tests
│   └── wishlist.test.ts         # Wishlist business logic tests
└── integration/                  # Integration tests
    └── checkout.test.ts         # End-to-end checkout flow
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- convex/tests/model/cart.test.ts
```

## Test Coverage

### Model Layer Tests
- ✅ **Cart Model** (17 tests)
  - getOrCreateCart
  - findCart
  - addItemToCart (with inventory validation)
  - removeItemFromCart
  - clearCartItems
  - calculateCartTotals
  - getCartItems

- ✅ **Wishlist Model** (14 tests)
  - getOrCreateWishlist
  - findWishlist
  - addItemToWishlist
  - removeItemFromWishlist
  - clearWishlistItems
  - mergeWishlists

### Integration Tests
- ✅ **Checkout Flow** (4 tests)
  - Full cart-to-checkout flow
  - Guest-to-user cart migration
  - Inventory validation before checkout
  - Cart clearing after checkout

## Writing New Tests

### Model Layer Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { createTestContext, createTestProduct } from '../setup';
import * as CartModel from '../../model/cart';

describe('My Feature', () => {
  it('should do something', async () => {
    const t = createTestContext();

    const result = await t.run(async (ctx) => {
      // Your test logic here
      return await CartModel.someFunction(ctx, args);
    });

    expect(result).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { createTestContext } from '../setup';

describe('Feature Integration', () => {
  it('should complete full flow', async () => {
    const t = createTestContext();

    // Step 1: Setup
    const ids = await t.run(async (ctx) => {
      // Create test data
      return { id1, id2 };
    });

    // Step 2: Execute
    const result = await t.run(async (ctx) => {
      // Run your flow
      return result;
    });

    // Step 3: Assert
    expect(result).toEqual(expected);
  });
});
```

## Test Utilities

### `createTestContext()`
Creates a new test context with the schema.

### `createTestUser(userId?, email?)`
Creates a test user identity.

### `createTestProduct(overrides?)`
Creates test product data.

### `createTestCart(userId?, sessionId?, overrides?)`
Creates test cart data.

### `createTestCartItem(cartId, catalogId, quantity?, overrides?)`
Creates test cart item data.

### `seedTestData(ctx)`
Seeds database with test product and cart.

## Notes

- Tests use `convex-test` for isolated database contexts
- Each test runs in its own transaction
- Tests are isolated and don't affect each other
- Model layer functions are tested directly
- Integration tests validate multi-step flows

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Manual workflow dispatch

See `.github/workflows/test.yml` for CI configuration.
