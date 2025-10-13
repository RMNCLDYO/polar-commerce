/**
 * Seeding Verification Script for Next.js 16
 * Verifies that all seeded data is correctly synced between Polar and Convex
 *
 * @requires Node.js 20.9+
 * @requires TypeScript 5+
 */

import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { api } from '../convex/_generated/api';
import { createLogger } from './logger';
import type {
  CatalogProduct,
  PageIteratorResponse,
  PolarProduct,
  VerificationResult,
} from './types';

dotenv.config({ path: '.env.local' });

const logger = createLogger({ prefix: '🔍' });

/**
 * Helper function to query Polar products with explicit typing
 * Bypasses deep type inference issues in Convex queries
 */
async function queryPolarProducts(
  client: ConvexHttpClient,
): Promise<PolarProduct[]> {
  // @ts-expect-error - Bypass deep type inference for Convex query
  return await client.query(api.polar.listAllProducts, {});
}

/**
 * Validates required environment variables
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment(): {
  convexUrl: string;
  polarToken: string;
  server: 'sandbox' | 'production';
} {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const server =
    (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';

  if (!convexUrl || !polarToken) {
    throw new Error('Missing required environment variables');
  }

  return { convexUrl, polarToken, server };
}

/**
 * Fetches and verifies Polar products
 */
async function verifyPolarProducts(
  polarClient: Polar,
): Promise<VerificationResult> {
  try {
    const productsIter = await polarClient.products.list({ limit: 100 });
    const polarProducts: PolarProduct[] = [];

    for await (const response of productsIter) {
      const typedResponse = response as unknown;
      if (
        typedResponse &&
        typeof typedResponse === 'object' &&
        'ok' in typedResponse &&
        typedResponse.ok === true &&
        'value' in typedResponse
      ) {
        const pageResponse = typedResponse as PageIteratorResponse;
        const items = pageResponse.value?.result?.items ?? [];
        polarProducts.push(...items.filter((p) => !p.isArchived));
      }
    }

    const subscriptionProducts = polarProducts.filter((p) => p.isRecurring);
    const oneTimeProducts = polarProducts.filter((p) => !p.isRecurring);

    const details = [
      `Total active products: ${polarProducts.length}`,
      `Subscription products: ${subscriptionProducts.length}`,
      `One-time products: ${oneTimeProducts.length}`,
    ];

    if (polarProducts.length === 0) {
      return {
        passed: false,
        message: 'No products found in Polar',
        details,
      };
    }

    return {
      passed: true,
      message: `Found ${polarProducts.length} active products in Polar`,
      details,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Failed to fetch Polar products: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verifies Convex polar.products table
 */
async function verifyConvexPolarProducts(
  convexClient: ConvexHttpClient,
): Promise<VerificationResult> {
  try {
    const polarConvexProducts = await queryPolarProducts(convexClient);

    const details = [
      `Total products in polar.products: ${polarConvexProducts.length}`,
    ];

    if (polarConvexProducts.length === 0) {
      return {
        passed: false,
        message: 'No products found in polar.products table',
        details,
      };
    }

    return {
      passed: true,
      message: `Found ${polarConvexProducts.length} products in polar.products`,
      details,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Failed to query polar.products: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verifies Convex app.catalog table
 */
async function verifyConvexCatalog(
  convexClient: ConvexHttpClient,
): Promise<VerificationResult> {
  try {
    const appProducts = (await convexClient.query(
      api.catalog.sync.listProducts,
      {},
    )) as CatalogProduct[];

    const subscriptionProducts = appProducts.filter(
      (p) => p.category === 'subscription',
    );
    const regularProducts = appProducts.filter(
      (p) => p.category !== 'subscription',
    );
    const linkedProducts = appProducts.filter((p) => p.polarProductId);
    const withImages = appProducts.filter((p) => p.imageUrl || p.polarImageUrl);

    const details = [
      `Total products: ${appProducts.length}`,
      `Subscription products: ${subscriptionProducts.length}`,
      `Regular products: ${regularProducts.length}`,
      `Linked to Polar: ${linkedProducts.length}/${appProducts.length}`,
      `With images: ${withImages.length}/${appProducts.length}`,
    ];

    if (appProducts.length === 0) {
      return {
        passed: false,
        message: 'No products found in app.catalog table',
        details,
      };
    }

    return {
      passed: true,
      message: `Found ${appProducts.length} products in app.catalog`,
      details,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Failed to query app.catalog: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verifies subscription tier configuration
 */
async function verifySubscriptionTiers(
  convexClient: ConvexHttpClient,
): Promise<VerificationResult> {
  try {
    const subscriptionProducts = await convexClient.query(
      api.polar.getSubscriptionProducts,
    );

    const expectedTiers = [
      { key: 'starterMonthly', name: 'Starter Monthly' },
      { key: 'starterYearly', name: 'Starter Yearly' },
      { key: 'premiumMonthly', name: 'Premium Monthly' },
      { key: 'premiumYearly', name: 'Premium Yearly' },
    ];

    const foundTiers = expectedTiers.filter(
      (tier) => subscriptionProducts[tier.key],
    );
    const missingTiers = expectedTiers.filter(
      (tier) => !subscriptionProducts[tier.key],
    );

    const details = [
      `Expected tiers: ${expectedTiers.length}`,
      `Found tiers: ${foundTiers.length}`,
      ...foundTiers.map((tier) => `  ✅ ${tier.name}`),
      ...missingTiers.map((tier) => `  ❌ ${tier.name}`),
    ];

    if (foundTiers.length === expectedTiers.length) {
      return {
        passed: true,
        message: 'All subscription tiers configured correctly',
        details,
      };
    }

    return {
      passed: false,
      message: `Missing ${missingTiers.length} subscription tier(s)`,
      details,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Failed to verify subscription tiers: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verifies data consistency between Polar and Convex
 */
async function verifyDataConsistency(
  convexClient: ConvexHttpClient,
): Promise<VerificationResult> {
  try {
    const appProducts = await convexClient.query(
      api.catalog.sync.listProducts,
      {},
    );
    const polarConvexProducts = await queryPolarProducts(convexClient);

    const appLinkedIds = new Set(
      appProducts
        .filter((p: CatalogProduct) => p.polarProductId)
        .map((p: CatalogProduct) => p.polarProductId as string),
    );
    const polarIds = new Set(
      polarConvexProducts.map((p: PolarProduct) => p.id),
    );

    const orphanedLinks = Array.from(appLinkedIds).filter(
      (id) => !polarIds.has(id),
    );
    const unlinkedPolarProducts = polarConvexProducts.filter(
      (p: PolarProduct) => !appLinkedIds.has(p.id),
    );

    const details = [
      `App products with Polar links: ${appLinkedIds.size}`,
      `Polar products in Convex: ${polarIds.size}`,
      `Orphaned links: ${orphanedLinks.length}`,
      `Unlinked Polar products: ${unlinkedPolarProducts.length}`,
    ];

    if (orphanedLinks.length > 0) {
      return {
        passed: false,
        message: `Found ${orphanedLinks.length} orphaned product link(s)`,
        details,
      };
    }

    return {
      passed: true,
      message: 'Data consistency check passed',
      details,
    };
  } catch (error) {
    return {
      passed: false,
      message: `Failed to verify data consistency: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Displays verification results
 */
function displayResults(results: VerificationResult[]): boolean {
  logger.separator();
  logger.section('📋 VERIFICATION RESULTS');
  logger.separator();
  logger.blank();

  let allPassed = true;

  for (const result of results) {
    if (result.passed) {
      logger.success(result.message);
    } else {
      logger.error(result.message);
      allPassed = false;
    }

    if (result.details && result.details.length > 0) {
      for (const detail of result.details) {
        logger.debug(`   ${detail}`);
      }
    }

    logger.blank();
  }

  logger.separator();

  if (allPassed) {
    logger.section('✅ ALL VERIFICATIONS PASSED!');
    logger.blank();
    logger.divider();
    logger.subsection(
      '✨ Your application is correctly seeded and ready to use!',
    );
    logger.divider();
    logger.blank();
    logger.subsection('🚀 Next Steps:');
    logger.list([
      "Run 'npm run dev' to start the application",
      'Visit /pricing to view subscription tiers',
      'Visit /shop to browse products',
      'Test the checkout flow',
    ]);
  } else {
    logger.section('⚠️  VERIFICATION FAILED');
    logger.blank();
    logger.subsection(
      'Some checks did not pass. Please review the issues above.',
    );
    logger.blank();
    logger.subsection('Common fixes:');
    logger.list([
      "Run 'npm run db:reset' to clear all data",
      "Run 'npm run polar:seed' to reseed everything",
      'Check your .env.local configuration',
      'Verify Polar API token has correct permissions',
    ]);
  }

  logger.separator();

  return allPassed;
}

/**
 * Main verification function
 */
export async function verifySeeding(): Promise<boolean> {
  logger.section('🔍 VERIFYING SEEDING');
  logger.separator();

  const env = validateEnvironment();
  const convexClient = new ConvexHttpClient(env.convexUrl);
  const polarClient = new Polar({
    accessToken: env.polarToken,
    server: env.server,
  });

  logger.subsection('📊 Verification Environment:');
  logger.item('Convex URL', env.convexUrl);
  logger.item('Polar Server', env.server);
  logger.blank();

  const results: VerificationResult[] = [];

  logger.step(1, 'Verifying Polar products...');
  results.push(await verifyPolarProducts(polarClient));

  logger.step(2, 'Verifying Convex polar.products table...');
  results.push(await verifyConvexPolarProducts(convexClient));

  logger.step(3, 'Verifying Convex app.catalog table...');
  results.push(await verifyConvexCatalog(convexClient));

  logger.step(4, 'Verifying subscription tiers...');
  results.push(await verifySubscriptionTiers(convexClient));

  logger.step(5, 'Verifying data consistency...');
  results.push(await verifyDataConsistency(convexClient));

  return displayResults(results);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifySeeding()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Fatal error during verification', error);
      process.exit(1);
    });
}
