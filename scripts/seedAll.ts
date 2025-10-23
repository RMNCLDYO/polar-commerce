import * as dotenv from 'dotenv';
import { seedProducts } from './seedProducts';
import { seedSubscriptions } from './seedSubscriptions';
import { verifySeeding } from './verifySeeding';

dotenv.config({ path: '.env.local' });

interface SeedingResults {
  subscriptions: boolean;
  products: boolean;
  verification: boolean;
}

function validateEnvironment(): void {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const polarServer = process.env.POLAR_SERVER || 'sandbox';

  if (process.env.NODE_ENV === 'development') {
    console.log('Environment Check:');

    if (convexUrl) {
      console.log(`  Convex URL: ${convexUrl}`);
    } else {
      console.log('  Convex URL: Not set');
    }

    if (polarToken) {
      console.log('  Polar Token: Set');
    } else {
      console.log('  Polar Token: Not set');
    }

    console.log(`  Polar Server: ${polarServer}`);
    console.log('');
  }

  if (!convexUrl || !polarToken) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Missing required environment variables!');
      console.log('Please ensure .env.local contains:');
      console.log('  - NEXT_PUBLIC_CONVEX_URL');
      console.log('  - POLAR_ORGANIZATION_TOKEN');
    }
    throw new Error('Missing required environment variables');
  }
}

async function executeStep(
  name: string,
  fn: () => Promise<void>,
): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Starting ${name}...`);
    }
    await fn();
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} completed`);
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`${name} failed`, error);
      console.warn(`Continuing despite ${name} issues...`);
    }
    return false;
  }
}

function displaySummary(results: SeedingResults): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(60));
    console.log('SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log('');

    const getStatus = (success: boolean) =>
      success ? '✅ Success' : '❌ Failed';

    console.log(`  Subscriptions: ${getStatus(results.subscriptions)}`);
    console.log(`  Products: ${getStatus(results.products)}`);
    console.log(`  Verification: ${getStatus(results.verification)}`);
    console.log('');

    const allSuccess =
      results.subscriptions && results.products && results.verification;

    if (allSuccess) {
      console.log('🎉 ALL SEEDING COMPLETED SUCCESSFULLY!');
      console.log('');
      console.log('-'.repeat(60));
      console.log('Your application is now fully seeded with:');
      console.log('  - Subscription tiers (Starter, Premium) synced to Polar & Convex');
      console.log('  - Product catalog with images synced to Polar & Convex');
      console.log('-'.repeat(60));

      console.log('');
      console.log('Next Steps:');
      console.log("  - Run 'npm run dev' to start the application");
      console.log('  - Visit /pricing to see subscription tiers');
      console.log('  - Visit /shop to see products');
      console.log('  - Test the checkout flow');
      console.log('='.repeat(60));
    } else {
      console.log('⚠️  SEEDING COMPLETED WITH WARNINGS');
      console.log('');
      console.log('Some steps encountered issues. You may need to:');
      console.log('  - Check the error messages above');
      console.log('  - Verify your Polar API token and permissions');
      console.log('');
      console.log('Run individual commands manually:');
      console.log('  - npm run polar:seed-subscriptions - Seed subscriptions only');
      console.log('  - npm run polar:seed-products      - Seed products only');
      console.log('  - npm run sync                     - Sync Polar to Convex');
      console.log('  - npm run verify                   - Run verification only');
    }
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedAll(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('COMPLETE SEEDING PROCESS');
    console.log('='.repeat(60));
    console.log('This will seed both subscriptions and products to:');
    console.log('  - Polar API (payment processing)');
    console.log('  - Convex Database (application data)');
    console.log('='.repeat(60));
    console.log('');
  }

  validateEnvironment();

  const results: SeedingResults = {
    subscriptions: false,
    products: false,
    verification: false,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('═══ STEP 1: SUBSCRIPTIONS ═══');
  }
  results.subscriptions = await executeStep(
    'Seeding subscription tiers',
    seedSubscriptions,
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('');
  }

  if (!results.subscriptions && process.env.NODE_ENV === 'development') {
    console.warn('Subscription seeding encountered issues');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Waiting for Polar API to process...');
  }
  await delay(2000);
  if (process.env.NODE_ENV === 'development') {
    console.log('');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('═══ STEP 2: PRODUCTS ═══');
  }
  results.products = await executeStep(
    'Seeding products catalog',
    seedProducts,
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('');
  }

  if (!results.products && process.env.NODE_ENV === 'development') {
    console.warn('Product seeding encountered issues');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('═══ STEP 3: VERIFICATION ═══');
  }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('Seeding process completed!');
        console.log('');
      }
      process.exit(0);
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Fatal error during seeding', error);
      }
      process.exit(1);
    });
}
