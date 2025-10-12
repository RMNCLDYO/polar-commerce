/**
 * Master Seeding Script for Next.js 16
 * Orchestrates complete seeding of subscriptions, products, and verification
 *
 * @requires Node.js 20.9+
 * @requires TypeScript 5+
 */

import * as dotenv from 'dotenv';
import { createLogger } from './logger';
import { seedProducts } from './seedProducts';
import { seedSubscriptions } from './seedSubscriptions';
import { verifySeeding } from './verifySeeding';

dotenv.config({ path: '.env.local' });

const logger = createLogger({ prefix: '🚀' });

interface SeedingResults {
  subscriptions: boolean;
  products: boolean;
  verification: boolean;
}

/**
 * Validates environment configuration before seeding
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment(): void {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const polarServer = process.env.POLAR_SERVER || 'sandbox';

  logger.subsection('📋 Environment Check:');

  if (convexUrl) {
    logger.success(`Convex URL: ${convexUrl}`);
  } else {
    logger.error('Convex URL: Not set');
  }

  if (polarToken) {
    logger.success('Polar Token: Set');
  } else {
    logger.error('Polar Token: Not set');
  }

  logger.item('Polar Server', polarServer);
  logger.blank();

  if (!convexUrl || !polarToken) {
    logger.error('Missing required environment variables!');
    logger.subsection('Please ensure .env.local contains:');
    logger.list(['NEXT_PUBLIC_CONVEX_URL', 'POLAR_ORGANIZATION_TOKEN']);
    throw new Error('Missing required environment variables');
  }
}

/**
 * Executes a seeding step with error handling
 */
async function executeStep(
  name: string,
  fn: () => Promise<void>,
): Promise<boolean> {
  try {
    logger.info(`Starting ${name}...`);
    await fn();
    logger.success(`${name} completed`);
    return true;
  } catch (error) {
    logger.error(`${name} failed`, error);
    logger.warning(`Continuing despite ${name} issues...`);
    return false;
  }
}

/**
 * Displays seeding summary
 */
function displaySummary(results: SeedingResults): void {
  logger.separator();
  logger.section('📊 SEEDING SUMMARY');
  logger.separator();
  logger.blank();

  const getStatus = (success: boolean) =>
    success ? '✅ Success' : '❌ Failed';

  logger.item('Subscriptions', getStatus(results.subscriptions));
  logger.item('Products', getStatus(results.products));
  logger.item('Verification', getStatus(results.verification));
  logger.blank();

  const allSuccess =
    results.subscriptions && results.products && results.verification;

  if (allSuccess) {
    logger.section('🎉 ALL SEEDING COMPLETED SUCCESSFULLY!');
    logger.blank();
    logger.divider();
    logger.subsection('✨ Your application is now fully seeded with:');
    logger.list([
      'Subscription tiers (Starter, Premium) synced to Polar & Convex',
      'Product catalog with images synced to Polar & Convex',
    ]);
    logger.divider();

    logger.blank();
    logger.subsection('📝 Next Steps:');
    logger.list([
      "Run 'npm run dev' to start the application",
      'Visit /pricing to see subscription tiers',
      'Visit /shop to see products',
      'Test the checkout flow',
    ]);
    logger.separator();
  } else {
    logger.section('⚠️  SEEDING COMPLETED WITH WARNINGS');
    logger.blank();
    logger.subsection('Some steps encountered issues. You may need to:');
    logger.list([
      'Check the error messages above',
      'Verify your Polar API token and permissions',
    ]);
    logger.blank();
    logger.subsection('Run individual commands manually:');
    logger.list([
      'npm run polar:seed-subscriptions - Seed subscriptions only',
      'npm run polar:seed-products      - Seed products only',
      'npm run sync                     - Sync Polar to Convex',
      'npm run verify                   - Run verification only',
    ]);
  }
}

/**
 * Pauses execution for specified milliseconds
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main seeding orchestration function
 */
async function seedAll(): Promise<void> {
  logger.section('🚀 COMPLETE SEEDING PROCESS');
  logger.separator();
  logger.subsection('This will seed both subscriptions and products to:');
  logger.list([
    'Polar API (payment processing)',
    'Convex Database (application data)',
  ]);
  logger.separator();
  logger.blank();

  validateEnvironment();

  const results: SeedingResults = {
    subscriptions: false,
    products: false,
    verification: false,
  };

  logger.section('═══ STEP 1: SUBSCRIPTIONS ═══');
  results.subscriptions = await executeStep(
    'Seeding subscription tiers',
    seedSubscriptions,
  );
  logger.blank();

  if (!results.subscriptions) {
    logger.warning('Subscription seeding encountered issues');
  }

  logger.info('⏳ Waiting for Polar API to process...');
  await delay(2000);
  logger.blank();

  logger.section('═══ STEP 2: PRODUCTS ═══');
  results.products = await executeStep(
    'Seeding products catalog',
    seedProducts,
  );
  logger.blank();

  if (!results.products) {
    logger.warning('Product seeding encountered issues');
  }

  logger.section('═══ STEP 3: VERIFICATION ═══');
  results.verification = await executeStep(
    'Verifying seeded data',
    async () => {
      const passed = await verifySeeding();
      if (!passed) {
        throw new Error('Verification checks failed');
      }
    },
  );

  displaySummary(results);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll()
    .then(() => {
      logger.success('✨ Seeding process completed!');
      logger.blank();
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fatal error during seeding', error);
      process.exit(1);
    });
}
