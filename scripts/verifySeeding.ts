import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { api } from '../convex/_generated/api';
import type {
  CatalogProduct,
  PageIteratorResponse,
  PolarProduct,
  VerificationResult,
} from './types';

dotenv.config({ path: '.env.local' });

async function queryPolarProducts(
  client: ConvexHttpClient,
): Promise<PolarProduct[]> {
  // @ts-expect-error - Bypass deep type inference for Convex query
  return await client.query(api.polar.listAllProducts, {});
}

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

async function verifyPolarProducts(
  polarClient: Polar,
): Promise<VerificationResult> {
  try {
    const productsIter = await polarClient.products.list({ limit: 100 });
    const polarProducts: PolarProduct[] = [];

    for await (const response of productsIter) {
      const typedResponse = response as unknown;
      if (typedResponse && typeof typedResponse === 'object') {
        let items: PolarProduct[] = [];

        if ('result' in typedResponse) {
          const result = (typedResponse as { result?: { items?: PolarProduct[] } }).result;
          items = result?.items ?? [];
        }
        else if ('ok' in typedResponse && typedResponse.ok === true && 'value' in typedResponse) {
          const pageResponse = typedResponse as PageIteratorResponse;
          items = pageResponse.value?.result?.items ?? [];
        }

        if (items.length > 0) {
          polarProducts.push(...items.filter((p) => !p.isArchived));
        }
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

function displayResults(results: VerificationResult[]): boolean {
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(60));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(60));
    console.log('');

    let allPassed = true;

    for (const result of results) {
      if (result.passed) {
        console.log(`✅ ${result.message}`);
      } else {
        console.log(`❌ ${result.message}`);
        allPassed = false;
      }

      if (result.details && result.details.length > 0) {
        for (const detail of result.details) {
          console.log(`   ${detail}`);
        }
      }

      console.log('');
    }

    console.log('='.repeat(60));

    if (allPassed) {
      console.log('✅ ALL VERIFICATIONS PASSED!');
      console.log('');
      console.log('-'.repeat(60));
      console.log('Your application is correctly seeded and ready to use!');
      console.log('-'.repeat(60));
      console.log('');
      console.log('Next Steps:');
      console.log("  - Run 'npm run dev' to start the application");
      console.log('  - Visit /pricing to view subscription tiers');
      console.log('  - Visit /shop to browse products');
      console.log('  - Test the checkout flow');
    } else {
      console.log('⚠️  VERIFICATION FAILED');
      console.log('');
      console.log('Some checks did not pass. Please review the issues above.');
      console.log('');
      console.log('Common fixes:');
      console.log("  - Run 'npm run db:reset' to clear all data");
      console.log("  - Run 'npm run polar:seed' to reseed everything");
      console.log('  - Check your .env.local configuration');
      console.log('  - Verify Polar API token has correct permissions');
    }

    console.log('='.repeat(60));

    return allPassed;
  }

  let allPassed = true;
  for (const result of results) {
    if (!result.passed) {
      allPassed = false;
      break;
    }
  }

  return allPassed;
}

export async function verifySeeding(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    console.log('VERIFYING SEEDING');
    console.log('='.repeat(60));
  }

  const env = validateEnvironment();
  const convexClient = new ConvexHttpClient(env.convexUrl);
  const polarClient = new Polar({
    accessToken: env.polarToken,
    server: env.server,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Verification Environment:');
    console.log(`  Convex URL: ${env.convexUrl}`);
    console.log(`  Polar Server: ${env.server}`);
    console.log('');
  }

  const results: VerificationResult[] = [];

  if (process.env.NODE_ENV === 'development') {
    console.log('Step 1: Verifying Polar products...');
  }
  results.push(await verifyPolarProducts(polarClient));

  if (process.env.NODE_ENV === 'development') {
    console.log('Step 2: Verifying Convex polar.products table...');
  }
  results.push(await verifyConvexPolarProducts(convexClient));

  if (process.env.NODE_ENV === 'development') {
    console.log('Step 3: Verifying Convex app.catalog table...');
  }
  results.push(await verifyConvexCatalog(convexClient));

  if (process.env.NODE_ENV === 'development') {
    console.log('Step 4: Verifying subscription tiers...');
  }
  results.push(await verifySubscriptionTiers(convexClient));

  if (process.env.NODE_ENV === 'development') {
    console.log('Step 5: Verifying data consistency...');
  }
  results.push(await verifyDataConsistency(convexClient));

  return displayResults(results);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifySeeding()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Fatal error during verification', error);
      }
      process.exit(1);
    });
}
