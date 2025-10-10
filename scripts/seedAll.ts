import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

async function runCommand(
  command: string,
  description: string,
): Promise<boolean> {
  console.log(`\n${colors.cyan}🔄 ${description}...${colors.reset}`);
  console.log(`   Running: ${colors.yellow}${command}${colors.reset}`);

  try {
    const { stdout, stderr } = await execAsync(command);

    // Print the output
    if (stdout) {
      console.log(stdout);
    }

    if (stderr && !stderr.includes('WARN')) {
      console.error(`${colors.yellow}⚠️  Warning:${colors.reset}`, stderr);
    }

    console.log(`${colors.green}✅ ${description} completed${colors.reset}`);
    return true;
  } catch (error: unknown) {
    console.error(`${colors.red}❌ ${description} failed${colors.reset}`);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`   Error: ${errorMessage}`);

    // Print the full error output for debugging
    if (
      error &&
      typeof error === 'object' &&
      'stdout' in error &&
      typeof error.stdout === 'string'
    ) {
      console.log(error.stdout);
    }
    if (
      error &&
      typeof error === 'object' &&
      'stderr' in error &&
      typeof error.stderr === 'string'
    ) {
      console.error(error.stderr);
    }

    return false;
  }
}

async function seedAll() {
  console.log(
    `${colors.bright}${colors.magenta}🚀 COMPLETE SEEDING PROCESS${colors.reset}`,
  );
  console.log('='.repeat(70));
  console.log('This will seed both subscriptions and products to:');
  console.log('  • Polar API (payment processing)');
  console.log('  • Convex Database (application data)');
  console.log('='.repeat(70));

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const polarServer = process.env.POLAR_SERVER || 'sandbox';

  // Validate environment
  console.log(`\n${colors.yellow}📋 Environment Check:${colors.reset}`);
  console.log(
    `  Convex URL: ${convexUrl ? `${colors.green}✓` : `${colors.red}✗`} ${convexUrl || 'Not set'}`,
  );
  console.log(
    `  Polar Token: ${polarToken ? `${colors.green}✓` : `${colors.red}✗`} ${polarToken ? 'Set' : 'Not set'}`,
  );
  console.log(`  Polar Server: ${colors.green}${polarServer}${colors.reset}`);

  if (!convexUrl || !polarToken) {
    console.error(
      `\n${colors.red}❌ Missing required environment variables!${colors.reset}`,
    );
    console.error('Please ensure .env.local contains:');
    console.error('  - NEXT_PUBLIC_CONVEX_URL');
    console.error('  - POLAR_ORGANIZATION_TOKEN');
    process.exit(1);
  }

  const results = {
    subscriptions: false,
    products: false,
    verification: false,
  };

  // Step 1: Seed Subscriptions
  console.log(
    `\n${colors.bright}${colors.blue}═══ STEP 1: SUBSCRIPTIONS ═══${colors.reset}`,
  );
  results.subscriptions = await runCommand(
    'npx tsx scripts/seedSubscriptions.ts',
    'Seeding subscription tiers',
  );

  if (!results.subscriptions) {
    console.log(
      `${colors.yellow}⚠️  Continuing despite subscription seeding issues...${colors.reset}`,
    );
  }

  // Add a small delay to ensure Polar API has processed the subscriptions
  console.log(
    `\n${colors.cyan}⏳ Waiting for Polar API to process...${colors.reset}`,
  );
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 2: Seed Products
  console.log(
    `\n${colors.bright}${colors.blue}═══ STEP 2: PRODUCTS ═══${colors.reset}`,
  );
  results.products = await runCommand(
    'npx tsx scripts/seedProducts.ts',
    'Seeding products catalog',
  );

  if (!results.products) {
    console.log(
      `${colors.yellow}⚠️  Product seeding encountered issues${colors.reset}`,
    );
  }

  // Step 3: Verify Everything
  console.log(
    `\n${colors.bright}${colors.blue}═══ STEP 3: VERIFICATION ═══${colors.reset}`,
  );
  results.verification = await runCommand(
    'npx tsx scripts/verifySeeding.ts',
    'Verifying seeded data',
  );

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.bright}📊 SEEDING SUMMARY${colors.reset}`);
  console.log('='.repeat(70));

  const getStatus = (success: boolean) =>
    success
      ? `${colors.green}✅ Success${colors.reset}`
      : `${colors.red}❌ Failed${colors.reset}`;

  console.log(`\nSubscriptions: ${getStatus(results.subscriptions)}`);
  console.log(`Products:      ${getStatus(results.products)}`);
  console.log(`Verification:  ${getStatus(results.verification)}`);

  const allSuccess =
    results.subscriptions && results.products && results.verification;

  if (allSuccess) {
    console.log(
      `\n${colors.bright}${colors.green}🎉 ALL SEEDING COMPLETED SUCCESSFULLY!${colors.reset}`,
    );
    console.log(`\n${'─'.repeat(70)}`);
    console.log('✨ Your application is now fully seeded with:');
    console.log(
      '  • Subscription tiers (Starter, Premium) synced to Polar & Convex',
    );
    console.log('  • Product catalog with images synced to Polar & Convex');
    console.log('─'.repeat(70));

    console.log(`\n${colors.cyan}📝 Next Steps:${colors.reset}`);
    console.log("  1. Run 'npm run dev' to start the application");
    console.log('  2. Visit /pricing to see subscription tiers');
    console.log('  3. Visit /shop to see products');
    console.log('  4. Test the checkout flow');
    console.log(`\n${'='.repeat(70)}`);
  } else {
    console.log(
      `\n${colors.yellow}⚠️  SEEDING COMPLETED WITH WARNINGS${colors.reset}`,
    );
    console.log('\nSome steps encountered issues. You may need to:');
    console.log('  1. Check the error messages above');
    console.log('  2. Verify your Polar API token and permissions');
    console.log('  3. Run individual commands manually:');
    console.log(
      `     ${colors.yellow}npm run polar:seed-subscriptions${colors.reset} - Seed subscriptions only`,
    );
    console.log(
      `     ${colors.yellow}npm run polar:seed-products${colors.reset}      - Seed products only`,
    );
    console.log(
      `     ${colors.yellow}npm run sync${colors.reset}               - Sync Polar to Convex`,
    );
    console.log(
      `     ${colors.yellow}npm run verify${colors.reset}             - Run verification only`,
    );
  }
}

// Run the complete seeding process
seedAll()
  .then(() => {
    console.log(
      `\n${colors.green}✨ Seeding process completed!${colors.reset}\n`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      `\n${colors.red}❌ Fatal error during seeding:${colors.reset}`,
      error,
    );
    process.exit(1);
  });
