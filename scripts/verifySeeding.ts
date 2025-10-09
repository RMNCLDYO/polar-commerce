import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';
import { Polar } from '@polar-sh/sdk';

// Load environment variables
dotenv.config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string[];
}

async function verifySeeding() {
  console.log(
    `${colors.bright}${colors.magenta}🔍 VERIFYING SEEDING${colors.reset}`,
  );
  console.log('='.repeat(70));

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const server =
    (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';

  if (!convexUrl || !polarToken) {
    console.error(
      `${colors.red}❌ Missing environment variables${colors.reset}`,
    );
    process.exit(1);
  }

  const convexClient = new ConvexHttpClient(convexUrl);
  const polarClient = new Polar({
    accessToken: polarToken,
    server: server,
  });

  const results: VerificationResult[] = [];

  console.log(`\n${colors.cyan}📊 Verification Environment:${colors.reset}`);
  console.log(`  Convex URL: ${convexUrl}`);
  console.log(`  Polar Server: ${server}\n`);

  // ==========================================
  // 1. Verify Polar Products
  // ==========================================
  console.log(`${colors.yellow}1️⃣  Verifying Polar products...${colors.reset}`);

  try {
    const polarProductsIter = await polarClient.products.list({ limit: 100 });
    const polarProducts: any[] = [];

    for await (const response of polarProductsIter) {
      const items = (response as any).result?.items || [];
      polarProducts.push(
        ...items.filter((p: any) => !p.isArchived && !p.is_archived),
      );
    }

    const subscriptionProducts = polarProducts.filter(
      (p: any) => p.isRecurring || p.is_recurring,
    );
    const oneTimeProducts = polarProducts.filter(
      (p: any) => !p.isRecurring && !p.is_recurring,
    );

    const details = [
      `Total active products: ${polarProducts.length}`,
      `Subscription products: ${subscriptionProducts.length}`,
      `One-time products: ${oneTimeProducts.length}`,
    ];

    if (polarProducts.length === 0) {
      results.push({
        passed: false,
        message: 'No products found in Polar',
        details,
      });
    } else {
      results.push({
        passed: true,
        message: `Found ${polarProducts.length} active products in Polar`,
        details,
      });
    }
  } catch (error: any) {
    results.push({
      passed: false,
      message: `Failed to fetch Polar products: ${error.message}`,
    });
  }

  // ==========================================
  // 2. Verify Convex polar.products table
  // ==========================================
  console.log(
    `${colors.yellow}2️⃣  Verifying Convex polar.products table...${colors.reset}`,
  );

  try {
    const polarConvexProducts = await convexClient.query(
      api.polar.listAllProducts,
      {},
    );

    const details = [
      `Total products in polar.products: ${polarConvexProducts.length}`,
    ];

    if (polarConvexProducts.length === 0) {
      results.push({
        passed: false,
        message: 'No products found in polar.products table',
        details,
      });
    } else {
      results.push({
        passed: true,
        message: `Found ${polarConvexProducts.length} products in polar.products`,
        details,
      });
    }
  } catch (error: any) {
    results.push({
      passed: false,
      message: `Failed to query polar.products: ${error.message}`,
    });
  }

  // ==========================================
  // 3. Verify Convex app.catalog table
  // ==========================================
  console.log(
    `${colors.yellow}3️⃣  Verifying Convex app.catalog table...${colors.reset}`,
  );

  try {
    const appProducts = await convexClient.query(
      api.catalog.sync.listProducts,
      {},
    );

    const subscriptionProducts = appProducts.filter(
      (p: any) => p.category === 'subscription',
    );
    const regularProducts = appProducts.filter(
      (p: any) => p.category !== 'subscription',
    );
    const linkedProducts = appProducts.filter((p: any) => p.polarProductId);
    const withImages = appProducts.filter(
      (p: any) => p.imageUrl || p.polarImageUrl,
    );

    const details = [
      `Total products: ${appProducts.length}`,
      `Subscription products: ${subscriptionProducts.length}`,
      `Regular products: ${regularProducts.length}`,
      `Linked to Polar: ${linkedProducts.length}/${appProducts.length}`,
      `With images: ${withImages.length}/${appProducts.length}`,
    ];

    if (appProducts.length === 0) {
      results.push({
        passed: false,
        message: 'No products found in app.catalog table',
        details,
      });
    } else {
      results.push({
        passed: true,
        message: `Found ${appProducts.length} products in app.catalog`,
        details,
      });
    }
  } catch (error: any) {
    results.push({
      passed: false,
      message: `Failed to query app.catalog: ${error.message}`,
    });
  }

  // ==========================================
  // 4. Verify Subscription Products
  // ==========================================
  console.log(
    `${colors.yellow}4️⃣  Verifying subscription tiers...${colors.reset}`,
  );

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
      results.push({
        passed: true,
        message: 'All subscription tiers configured correctly',
        details,
      });
    } else {
      results.push({
        passed: false,
        message: `Missing ${missingTiers.length} subscription tier(s)`,
        details,
      });
    }
  } catch (error: any) {
    results.push({
      passed: false,
      message: `Failed to verify subscription tiers: ${error.message}`,
    });
  }

  // ==========================================
  // 5. Verify Data Consistency
  // ==========================================
  console.log(
    `${colors.yellow}5️⃣  Verifying data consistency...${colors.reset}`,
  );

  try {
    const appProducts = await convexClient.query(
      api.catalog.sync.listProducts,
      {},
    );
    const polarConvexProducts = await convexClient.query(
      api.polar.listAllProducts,
      {},
    );

    const appLinkedIds = new Set(
      appProducts
        .filter((p: any) => p.polarProductId)
        .map((p: any) => p.polarProductId),
    );
    const polarIds = new Set(polarConvexProducts.map((p: any) => p.id));

    const orphanedLinks = [...appLinkedIds].filter((id) => !polarIds.has(id));
    const unlinkedPolarProducts = polarConvexProducts.filter(
      (p: any) => !appLinkedIds.has(p.id),
    );

    const details = [
      `App products with Polar links: ${appLinkedIds.size}`,
      `Polar products in Convex: ${polarIds.size}`,
      `Orphaned links: ${orphanedLinks.length}`,
      `Unlinked Polar products: ${unlinkedPolarProducts.length}`,
    ];

    if (orphanedLinks.length > 0) {
      results.push({
        passed: false,
        message: `Found ${orphanedLinks.length} orphaned product link(s)`,
        details,
      });
    } else {
      results.push({
        passed: true,
        message: 'Data consistency check passed',
        details,
      });
    }
  } catch (error: any) {
    results.push({
      passed: false,
      message: `Failed to verify data consistency: ${error.message}`,
    });
  }

  // ==========================================
  // Display Results
  // ==========================================
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bright}📋 VERIFICATION RESULTS${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  let allPassed = true;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;

    console.log(`${icon} ${color}${result.message}${colors.reset}`);

    if (result.details && result.details.length > 0) {
      result.details.forEach((detail) => {
        console.log(`   ${detail}`);
      });
    }

    console.log();

    if (!result.passed) {
      allPassed = false;
    }
  });

  // ==========================================
  // Summary
  // ==========================================
  console.log('='.repeat(70));

  if (allPassed) {
    console.log(
      `${colors.bright}${colors.green}✅ ALL VERIFICATIONS PASSED!${colors.reset}`,
    );
    console.log('\n' + '─'.repeat(70));
    console.log('✨ Your application is correctly seeded and ready to use!');
    console.log('─'.repeat(70));
    console.log(`\n${colors.cyan}🚀 Next Steps:${colors.reset}`);
    console.log("  1. Run 'npm run dev' to start the application");
    console.log('  2. Visit /pricing to view subscription tiers');
    console.log('  3. Visit /shop to browse products');
    console.log('  4. Test the checkout flow');
  } else {
    console.log(
      `${colors.bright}${colors.yellow}⚠️  VERIFICATION FAILED${colors.reset}`,
    );
    console.log('\nSome checks did not pass. Please review the issues above.');
    console.log('\nCommon fixes:');
    console.log("  • Run 'npm run db:reset' to clear all data");
    console.log("  • Run 'npm run polar:seed' to reseed everything");
    console.log('  • Check your .env.local configuration');
    console.log('  • Verify Polar API token has correct permissions');
  }

  console.log('\n' + '='.repeat(70));

  return allPassed;
}

// Run verification
verifySeeding()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error(
      `\n${colors.red}❌ Fatal error during verification:${colors.reset}`,
      error,
    );
    process.exit(1);
  });
