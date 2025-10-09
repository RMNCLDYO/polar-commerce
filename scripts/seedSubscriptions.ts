import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

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

interface ProductPlan {
  name: string;
  description: string;
  priceAmount: number; // in cents
  recurringInterval: 'month' | 'year';
  tierName: string;
  tierLevel: string;
}

async function seedSubscriptions() {
  console.log(
    `${colors.bright}${colors.magenta}🚀 SEEDING SUBSCRIPTIONS${colors.reset}`,
  );
  console.log('='.repeat(70));

  const token = process.env.POLAR_ORGANIZATION_TOKEN;
  const server =
    (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!token) {
    console.error(
      `${colors.red}❌ POLAR_ORGANIZATION_TOKEN not found${colors.reset}`,
    );
    process.exit(1);
  }

  if (!convexUrl) {
    console.error(
      `${colors.red}❌ NEXT_PUBLIC_CONVEX_URL not found${colors.reset}`,
    );
    process.exit(1);
  }

  const polarClient = new Polar({
    accessToken: token,
    server: server,
  });

  const convexClient = new ConvexHttpClient(convexUrl);

  console.log(`Environment: ${server}`);
  console.log(`Convex URL: ${convexUrl}\n`);

  try {
    // Load subscriptions from JSON file
    const subscriptionsPath = join(process.cwd(), 'subscriptions.json');
    const subscriptionsData = JSON.parse(
      readFileSync(subscriptionsPath, 'utf-8'),
    );

    // Build product plans from subscriptions.json (excluding Free tier)
    const SUBSCRIPTION_PLANS: ProductPlan[] = [];

    subscriptionsData.subscriptions.forEach((sub: any) => {
      // Skip free tier (no Polar product needed)
      if (sub.id === 'free') return;

      // Add monthly plan
      if (sub.pricing.monthly.amount > 0) {
        SUBSCRIPTION_PLANS.push({
          name: `${sub.name} Monthly`,
          description: `${sub.description} - Monthly billing`,
          priceAmount: Math.round(sub.pricing.monthly.amount * 100), // Convert to cents
          recurringInterval: 'month',
          tierName: sub.name,
          tierLevel: sub.tier,
        });
      }

      // Add yearly plan
      if (sub.pricing.yearly.amount > 0) {
        const savings = sub.pricing.yearly.savings || '';
        SUBSCRIPTION_PLANS.push({
          name: `${sub.name} Yearly`,
          description: `${sub.description} - Annual billing. ${savings}`,
          priceAmount: Math.round(sub.pricing.yearly.amount * 100), // Convert to cents
          recurringInterval: 'year',
          tierName: sub.name,
          tierLevel: sub.tier,
        });
      }
    });

    console.log(
      `${colors.cyan}📦 Found ${SUBSCRIPTION_PLANS.length} subscription plans to process${colors.reset}\n`,
    );

    // STEP 1: Check/Create products in Polar
    console.log(
      `${colors.yellow}🐻 Step 1: Creating/Updating Polar subscription products...${colors.reset}`,
    );

    const productsIter = await polarClient.products.list({ limit: 100 });
    const existingProducts: any[] = [];

    for await (const response of productsIter) {
      const items = (response as any).result?.items || [];
      // Filter out archived products to avoid reusing them
      existingProducts.push(
        ...items.filter((p: any) => !p.isArchived && !p.is_archived),
      );
    }

    console.log(
      `  Found ${existingProducts.length} existing active Polar products\n`,
    );

    const createdProducts: {
      name: string;
      id: string;
      price: string;
      tier: string;
    }[] = [];

    for (const plan of SUBSCRIPTION_PLANS) {
      console.log(`${colors.bright}Processing: ${plan.name}${colors.reset}`);
      console.log(
        `  Price: $${plan.priceAmount / 100}/${plan.recurringInterval}`,
      );

      // Check if product already exists by name
      const existingProduct = existingProducts.find(
        (p: any) => p.name === plan.name,
      );

      let productId: string;

      if (existingProduct) {
        console.log(
          `  ${colors.yellow}✓ Found existing product (ID: ${existingProduct.id})${colors.reset}`,
        );
        productId = existingProduct.id;

        createdProducts.push({
          name: plan.name,
          id: productId,
          price: `$${plan.priceAmount / 100}/${plan.recurringInterval}`,
          tier: plan.tierLevel,
        });
        continue;
      }

      // Create new subscription product
      console.log(
        `  ${colors.cyan}Creating new subscription product...${colors.reset}`,
      );

      const newProduct = await polarClient.products.create({
        name: plan.name,
        description: plan.description,
        recurringInterval: plan.recurringInterval, // Set at product level, not price level!
        prices: [
          {
            amountType: 'fixed',
            priceAmount: plan.priceAmount,
            priceCurrency: 'usd',
          },
        ],
      });

      console.log(
        `  ${colors.green}✓ Created successfully (ID: ${newProduct.id})${colors.reset}`,
      );
      productId = newProduct.id;

      // Upload subscription image to Polar S3
      try {
        console.log(
          `  ${colors.cyan}Uploading image to Polar...${colors.reset}`,
        );

        const imagePath = join(
          process.cwd(),
          'public',
          'products',
          'subscription.png',
        );
        const imageBuffer = readFileSync(imagePath);
        const fileName = 'subscription.png';
        const fileSize = imageBuffer.length;
        const sha256Hash = createHash('sha256')
          .update(imageBuffer)
          .digest('base64');

        const createResponse = await polarClient.files.create({
          name: fileName,
          mimeType: 'image/png',
          size: fileSize,
          checksumSha256Base64: sha256Hash,
          upload: {
            parts: [
              {
                number: 1,
                chunkStart: 0,
                chunkEnd: fileSize,
                checksumSha256Base64: sha256Hash,
              },
            ],
          },
          service: 'product_media',
        });

        if (
          !createResponse.upload ||
          !('parts' in createResponse.upload) ||
          !createResponse.upload.parts.length
        ) {
          throw new Error('No upload URL returned from Polar');
        }

        const part = createResponse.upload.parts[0];
        if (!part) {
          throw new Error('No upload part available');
        }

        const uploadHeaders = {
          'Content-Type': 'image/png',
          ...part.headers,
        };

        const s3Response = await fetch(part.url, {
          method: 'PUT',
          headers: uploadHeaders,
          body: imageBuffer as any,
        });

        if (!s3Response.ok) {
          throw new Error(`S3 upload failed: ${s3Response.status}`);
        }

        const etag = s3Response.headers.get('etag')?.replace(/"/g, '') || '';

        const uploadedFile = await polarClient.files.uploaded({
          id: createResponse.id,
          fileUploadCompleted: {
            id: createResponse.upload.id,
            path: createResponse.upload.path,
            parts: [
              {
                number: part.number,
                checksumEtag: etag,
                checksumSha256Base64: sha256Hash,
              },
            ],
          },
        });

        console.log(
          `  ${colors.green}✓ Image uploaded successfully${colors.reset}`,
        );

        // Link image to Polar product
        await polarClient.products.update({
          id: productId,
          productUpdate: {
            medias: [uploadedFile.id],
          },
        });
        console.log(
          `  ${colors.green}✓ Image linked to product${colors.reset}`,
        );
      } catch (error: any) {
        console.error(
          `  ${colors.yellow}⚠ Warning: Could not upload image: ${error.message}${colors.reset}`,
        );
        console.log(
          `  ${colors.yellow}  Continuing without image...${colors.reset}`,
        );
      }

      createdProducts.push({
        name: plan.name,
        id: productId,
        price: `$${plan.priceAmount / 100}/${plan.recurringInterval}`,
        tier: plan.tierLevel,
      });
    }

    // STEP 2: Sync products to both polar.products and app.products tables
    console.log(
      `\n${colors.yellow}🔄 Step 2: Syncing subscription products to Convex...${colors.reset}`,
    );

    try {
      // First sync to polar.products table
      await convexClient.action(api.polar.syncProducts, {});
      console.log(
        `  ${colors.green}✓ Synced to polar.products table${colors.reset}`,
      );

      // Now also create them in app.products table for the storefront
      // Fetch the synced polar products to get Polar image URLs
      const polarProducts = await convexClient.query(
        api.polar.listAllProducts,
        {},
      );

      for (const product of createdProducts) {
        const plan = SUBSCRIPTION_PLANS.find((p) => p.name === product.name);
        if (plan) {
          // Find the corresponding polar product to get the Polar image URL
          const polarProduct = polarProducts.find(
            (p: any) => p.id === product.id,
          );
          const polarImageUrl =
            polarProduct?.medias?.[0]?.publicUrl || undefined;

          // Check if product already exists in catalog
          const existingProducts = await convexClient.query(
            api.catalog.sync.listProducts,
            {},
          );
          const existingProduct = existingProducts.find(
            (p: any) => p.polarProductId === product.id,
          );

          if (!existingProduct) {
            // Create in catalog with Polar image URL
            await convexClient.mutation(api.catalog.catalog.createProduct, {
              name: product.name,
              price: plan.priceAmount,
              category: 'subscription',
              imageUrl: '/products/subscription.png', // Fallback
              description: plan.description,
              polarProductId: product.id,
              polarImageUrl: polarImageUrl,
            });
            console.log(
              `  ${colors.green}✓ Created ${product.name} in catalog${colors.reset}`,
            );
          } else {
            // Update existing product with Polar image URL if available
            if (
              polarImageUrl &&
              existingProduct.polarImageUrl !== polarImageUrl
            ) {
              await convexClient.mutation(api.catalog.catalog.updateProduct, {
                productId: existingProduct._id,
                updates: {
                  polarImageUrl: polarImageUrl,
                },
              });
              console.log(
                `  ${colors.green}✓ Updated ${product.name} with Polar image${colors.reset}`,
              );
            } else {
              console.log(
                `  ${colors.yellow}✓ ${product.name} already exists in catalog${colors.reset}`,
              );
            }
          }
        }
      }
    } catch (error: any) {
      console.error(
        `  ${colors.red}❌ Error syncing: ${error.message}${colors.reset}`,
      );
    }

    // STEP 3: Verify the sync in both tables
    console.log(
      `\n${colors.yellow}✅ Step 3: Verifying subscription products...${colors.reset}`,
    );

    // Check polar.products table via getSubscriptionProducts
    const subscriptionProducts = await convexClient.query(
      api.polar.getSubscriptionProducts,
    );

    if (subscriptionProducts && Object.keys(subscriptionProducts).length > 0) {
      console.log(
        `  ${colors.green}✓ Found ${Object.keys(subscriptionProducts).length} subscription products in polar.products${colors.reset}`,
      );

      const expectedProducts = [
        'starterMonthly',
        'starterYearly',
        'premiumMonthly',
        'premiumYearly',
      ];
      const foundProducts = Object.keys(subscriptionProducts);

      expectedProducts.forEach((key) => {
        if (foundProducts.includes(key)) {
          const product = subscriptionProducts[key];
          console.log(`    ✅ ${product.name}: ${product.id}`);
        } else {
          console.log(`    ⚠️  Missing: ${key}`);
        }
      });
    } else {
      console.log(
        `  ${colors.yellow}⚠️  No subscription products found in polar.products${colors.reset}`,
      );
    }

    // Check catalog table
    const allProducts = await convexClient.query(
      api.catalog.sync.listProducts,
      {},
    );
    const subProducts = allProducts.filter(
      (p: any) => p.category === 'subscription',
    );

    if (subProducts.length > 0) {
      console.log(
        `  ${colors.green}✓ Found ${subProducts.length} subscription products in catalog${colors.reset}`,
      );
      subProducts.forEach((p: any) => {
        console.log(`    ✅ ${p.name}: ${p.polarProductId}`);
      });
    } else {
      console.log(
        `  ${colors.yellow}⚠️  No subscription products found in catalog${colors.reset}`,
      );
    }

    // Display summary
    console.log('\n' + '='.repeat(70));
    console.log(
      `${colors.bright}${colors.green}✅ SUBSCRIPTION SEEDING COMPLETE!${colors.reset}`,
    );
    console.log('='.repeat(70) + '\n');

    console.log('Created/Updated Subscription Products:');
    console.log('─'.repeat(70));
    createdProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Price: ${p.price}`);
      console.log(`   Tier: ${p.tier}`);
      console.log();
    });

    // Generate environment variables
    console.log('📝 Environment Variables (add to .env.local if needed):');
    console.log('─'.repeat(70));
    createdProducts.forEach((p) => {
      const envKey = `POLAR_PRODUCT_${p.tier.toUpperCase()}_${p.name.includes('Monthly') ? 'MONTHLY' : 'YEARLY'}`;
      console.log(`${envKey}=${p.id}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('Next steps:');
    console.log('  1. Verify subscription products in Polar dashboard');
    console.log("  2. Test checkout flow with 'npm run dev'");
    console.log('  3. Monitor webhook events for subscription updates');
    console.log('='.repeat(70));
  } catch (error: any) {
    console.error(`\n${colors.red}❌ Seeding failed!${colors.reset}`);
    console.error(`Error: ${error.message}`);

    if (error.message.includes('401')) {
      console.error('\n🔑 Authentication failed. Please check:');
      console.error('   1. POLAR_ORGANIZATION_TOKEN is correct');
      console.error('   2. Token has not expired');
      console.error('   3. Token has required permissions');
    }

    process.exit(1);
  }
}

// Run the seeding
seedSubscriptions()
  .then(() => {
    console.log(
      `\n${colors.green}✨ Subscription seeding completed successfully!${colors.reset}`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${colors.red}❌ Unexpected error:${colors.reset}`, error);
    process.exit(1);
  });
