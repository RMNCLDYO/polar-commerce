/**
 * Subscription Seeding Script for Next.js 16
 * Handles seeding of subscription products from JSON data to Polar API and Convex database
 *
 * @requires Node.js 20.9+
 * @requires TypeScript 5+
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { createLogger } from './logger';
import type {
  CatalogProduct,
  CreatedSubscription,
  PageIteratorResponse,
  PolarConvexProduct,
  PolarProduct,
  ProductPlan,
  SubscriptionData,
} from './types';

dotenv.config({ path: '.env.local' });

const logger = createLogger({ prefix: '🔄' });

/**
 * Validates required environment variables
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment(): {
  token: string;
  server: 'sandbox' | 'production';
  convexUrl: string;
} {
  const token = process.env.POLAR_ORGANIZATION_TOKEN;
  const server =
    (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!token) {
    throw new Error('POLAR_ORGANIZATION_TOKEN not found in environment');
  }

  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL not found in environment');
  }

  return { token, server, convexUrl };
}

/**
 * Loads subscription data from JSON file and converts to product plans
 * @returns {ProductPlan[]} Array of subscription product plans (excluding free tier)
 */
function loadSubscriptionPlans(): ProductPlan[] {
  const subscriptionsPath = join(process.cwd(), 'data', 'subscriptions.json');
  const subscriptionsData = JSON.parse(
    readFileSync(subscriptionsPath, 'utf-8'),
  ) as {
    subscriptions: SubscriptionData[];
  };

  const plans: ProductPlan[] = [];

  subscriptionsData.subscriptions.forEach((sub) => {
    if (sub.id === 'free') return;

    if (sub.pricing.monthly.amount > 0) {
      plans.push({
        name: `${sub.name} Monthly`,
        description: `${sub.description} - Monthly billing`,
        priceAmount: Math.round(sub.pricing.monthly.amount * 100),
        recurringInterval: 'month',
        tierName: sub.name,
        tierLevel: sub.tier,
      });
    }

    if (sub.pricing.yearly.amount > 0) {
      const savings = sub.pricing.yearly.savings ?? '';
      plans.push({
        name: `${sub.name} Yearly`,
        description: `${sub.description} - Annual billing. ${savings}`,
        priceAmount: Math.round(sub.pricing.yearly.amount * 100),
        recurringInterval: 'year',
        tierName: sub.name,
        tierLevel: sub.tier,
      });
    }
  });

  return plans;
}

/**
 * Fetches existing products from Polar API
 * @param {Polar} polarClient - Polar SDK client instance
 * @returns {Promise<PolarProduct[]>} Array of existing non-archived products
 */
async function fetchExistingPolarProducts(
  polarClient: Polar,
): Promise<PolarProduct[]> {
  const productsIter = await polarClient.products.list({ limit: 100 });
  const existingProducts: PolarProduct[] = [];

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
      existingProducts.push(
        ...items.filter((p) => !p.isArchived && !p.is_archived),
      );
    }
  }

  return existingProducts;
}

/**
 * Creates a new subscription product in Polar
 */
async function createPolarSubscriptionProduct(
  polarClient: Polar,
  plan: ProductPlan,
): Promise<PolarProduct> {
  logger.info(`Creating subscription product: ${plan.name}`);

  return await polarClient.products.create({
    name: plan.name,
    description: plan.description,
    recurringInterval: plan.recurringInterval,
    prices: [
      {
        amountType: 'fixed',
        priceAmount: plan.priceAmount,
        priceCurrency: 'usd',
      },
    ],
  });
}

/**
 * Uploads subscription image to Polar S3
 */
async function uploadSubscriptionImage(
  polarClient: Polar,
  productId: string,
): Promise<void> {
  try {
    logger.info('Uploading subscription image...');

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
      !createResponse.upload.parts.length ||
      !createResponse.upload.parts[0]
    ) {
      throw new Error('No upload URL returned from Polar');
    }

    const part = createResponse.upload.parts[0];

    const s3Response = await fetch(part.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
        ...part.headers,
      },
      body: imageBuffer,
    });

    if (!s3Response.ok) {
      throw new Error(`S3 upload failed with status: ${s3Response.status}`);
    }

    const etag = s3Response.headers.get('etag')?.replace(/"/g, '') ?? '';

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

    logger.success('Image uploaded successfully');

    await polarClient.products.update({
      id: productId,
      productUpdate: {
        medias: [uploadedFile.id],
      },
    });
    logger.success('Image linked to product');
  } catch (error) {
    logger.warning(`Could not upload image, continuing without it`, error);
  }
}

/**
 * Syncs subscription products to Convex catalog
 */
async function syncSubscriptionsToCatalog(
  convexClient: ConvexHttpClient,
  createdProducts: CreatedSubscription[],
  subscriptionPlans: ProductPlan[],
): Promise<void> {
  logger.info('Syncing subscription products to Convex...');

  await convexClient.action(api.polar.syncProducts, {});
  logger.success('Synced to polar.products table');

  const polarProducts = (await convexClient.query(
    api.polar.listAllProducts,
    {},
  )) as PolarConvexProduct[];

  for (const product of createdProducts) {
    const plan = subscriptionPlans.find((p) => p.name === product.name);
    if (!plan) continue;

    const polarProduct = polarProducts.find((p) => p.id === product.id);
    const polarImageUrl = polarProduct?.medias?.[0]?.publicUrl;

    const existingProducts = (await convexClient.query(
      api.catalog.sync.listProducts,
      {},
    )) as CatalogProduct[];
    const existingProduct = existingProducts.find(
      (p) => p.polarProductId === product.id,
    );

    if (!existingProduct) {
      await convexClient.mutation(api.catalog.catalog.createProduct, {
        name: product.name,
        price: plan.priceAmount,
        category: 'subscription',
        imageUrl: '/products/subscription.png',
        description: plan.description,
        polarProductId: product.id,
        polarImageUrl,
      });
      logger.success(`Created ${product.name} in catalog`);
    } else if (
      polarImageUrl &&
      existingProduct.polarImageUrl !== polarImageUrl
    ) {
      await convexClient.mutation(api.catalog.catalog.updateProduct, {
        productId: existingProduct._id as Id<'catalog'>,
        updates: {
          polarImageUrl,
        },
      });
      logger.success(`Updated ${product.name} with Polar image`);
    } else {
      logger.info(`${product.name} already exists in catalog`);
    }
  }
}

/**
 * Verifies subscription products in Convex
 */
async function verifySubscriptionProducts(
  convexClient: ConvexHttpClient,
): Promise<void> {
  const subscriptionProducts = await convexClient.query(
    api.polar.getSubscriptionProducts,
  );

  if (subscriptionProducts && Object.keys(subscriptionProducts).length > 0) {
    logger.success(
      `Found ${Object.keys(subscriptionProducts).length} subscription products in polar.products`,
    );

    const expectedProducts = [
      'starterMonthly',
      'starterYearly',
      'premiumMonthly',
      'premiumYearly',
    ];

    for (const key of expectedProducts) {
      const product = subscriptionProducts[key];
      if (product && 'name' in product) {
        logger.success(`${product.name}: ${product.id}`);
      } else {
        logger.warning(`Missing: ${key}`);
      }
    }
  } else {
    logger.warning('No subscription products found in polar.products');
  }

  const allProducts = (await convexClient.query(
    api.catalog.sync.listProducts,
    {},
  )) as CatalogProduct[];
  const subProducts = allProducts.filter((p) => p.category === 'subscription');

  if (subProducts.length > 0) {
    logger.success(
      `Found ${subProducts.length} subscription products in catalog`,
    );
    for (const p of subProducts) {
      logger.success(`${p.name}: ${p.polarProductId}`);
    }
  } else {
    logger.warning('No subscription products found in catalog');
  }
}

/**
 * Main seeding function for subscriptions
 */
export async function seedSubscriptions(): Promise<void> {
  logger.section('🚀 SEEDING SUBSCRIPTIONS');

  const env = validateEnvironment();
  const polarClient = new Polar({
    accessToken: env.token,
    server: env.server,
  });
  const convexClient = new ConvexHttpClient(env.convexUrl);

  logger.item('Environment', env.server);
  logger.item('Convex URL', env.convexUrl);
  logger.blank();

  try {
    const subscriptionPlans = loadSubscriptionPlans();
    logger.success(
      `Found ${subscriptionPlans.length} subscription plans to process`,
    );
    logger.blank();

    logger.step(1, 'Creating/Updating Polar subscription products...');
    const existingProducts = await fetchExistingPolarProducts(polarClient);
    logger.item('Existing products', existingProducts.length);
    logger.blank();

    const createdProducts: CreatedSubscription[] = [];

    for (let i = 0; i < subscriptionPlans.length; i++) {
      const plan = subscriptionPlans[i];
      if (!plan) continue;

      logger.progress(i + 1, subscriptionPlans.length, plan.name);
      logger.item(
        'Price',
        `$${plan.priceAmount / 100}/${plan.recurringInterval}`,
      );

      const existingProduct = existingProducts.find(
        (p) => p.name === plan.name,
      );

      if (existingProduct) {
        logger.info(`Found existing product (ID: ${existingProduct.id})`);
        createdProducts.push({
          name: plan.name,
          id: existingProduct.id,
          price: `$${plan.priceAmount / 100}/${plan.recurringInterval}`,
          tier: plan.tierLevel,
        });
        continue;
      }

      const newProduct = await createPolarSubscriptionProduct(
        polarClient,
        plan,
      );
      logger.success(`Created successfully (ID: ${newProduct.id})`);

      await uploadSubscriptionImage(polarClient, newProduct.id);

      createdProducts.push({
        name: plan.name,
        id: newProduct.id,
        price: `$${plan.priceAmount / 100}/${plan.recurringInterval}`,
        tier: plan.tierLevel,
      });
      logger.blank();
    }

    logger.step(2, 'Syncing subscription products to Convex...');
    await syncSubscriptionsToCatalog(
      convexClient,
      createdProducts,
      subscriptionPlans,
    );
    logger.blank();

    logger.step(3, 'Verifying subscription products...');
    await verifySubscriptionProducts(convexClient);

    logger.separator();
    logger.section('✅ SUBSCRIPTION SEEDING COMPLETE!');
    logger.separator();
    logger.blank();

    logger.subsection('Created/Updated Subscription Products:');
    logger.divider();
    createdProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      logger.item('ID', p.id);
      logger.item('Price', p.price);
      logger.item('Tier', p.tier);
      logger.blank();
    });

    logger.subsection(
      '📝 Environment Variables (add to .env.local if needed):',
    );
    logger.divider();
    createdProducts.forEach((p) => {
      const envKey = `POLAR_PRODUCT_${p.tier.toUpperCase()}_${p.name.includes('Monthly') ? 'MONTHLY' : 'YEARLY'}`;
      console.log(`${envKey}=${p.id}`);
    });

    logger.separator();
    logger.subsection('Next steps:');
    logger.list([
      'Verify subscription products in Polar dashboard',
      "Test checkout flow with 'npm run dev'",
      'Monitor webhook events for subscription updates',
    ]);
    logger.separator();
  } catch (error) {
    logger.error('Seeding failed!', error);

    if (error instanceof Error && error.message.includes('401')) {
      logger.warning('Authentication failed. Please check:');
      logger.list([
        'POLAR_ORGANIZATION_TOKEN is correct',
        'Token has not expired',
        'Token has required permissions',
      ]);
    }

    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSubscriptions()
    .then(() => {
      logger.success('✨ Subscription seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Unexpected error occurred', error);
      process.exit(1);
    });
}
