import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
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

async function createPolarSubscriptionProduct(
  polarClient: Polar,
  plan: ProductPlan,
): Promise<PolarProduct> {

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

async function uploadSubscriptionImage(
  polarClient: Polar,
  productId: string,
): Promise<void> {
  try {

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

    await polarClient.products.update({
      id: productId,
      productUpdate: {
        medias: [uploadedFile.id],
      },
    });
  } catch (error) {
  }
}

async function syncSubscriptionsToCatalog(
  convexClient: ConvexHttpClient,
  createdProducts: CreatedSubscription[],
  subscriptionPlans: ProductPlan[],
): Promise<void> {
  await convexClient.action(api.polar.syncProducts, {});

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
    }
  }
}

async function verifySubscriptionProducts(
  convexClient: ConvexHttpClient,
): Promise<void> {
  await convexClient.query(
    api.polar.getSubscriptionProducts,
  );

  await convexClient.query(
    api.catalog.sync.listProducts,
    {},
  );
}

export async function seedSubscriptions(): Promise<void> {
  const env = validateEnvironment();
  const polarClient = new Polar({
    accessToken: env.token,
    server: env.server,
  });
  const convexClient = new ConvexHttpClient(env.convexUrl);

  try {
    const subscriptionPlans = loadSubscriptionPlans();
    const existingProducts = await fetchExistingPolarProducts(polarClient);

    const createdProducts: CreatedSubscription[] = [];

    for (let i = 0; i < subscriptionPlans.length; i++) {
      const plan = subscriptionPlans[i];
      if (!plan) continue;

      const existingProduct = existingProducts.find(
        (p) => p.name === plan.name,
      );

      if (existingProduct) {
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

      await uploadSubscriptionImage(polarClient, newProduct.id);

      createdProducts.push({
        name: plan.name,
        id: newProduct.id,
        price: `$${plan.priceAmount / 100}/${plan.recurringInterval}`,
        tier: plan.tierLevel,
      });
    }

    await syncSubscriptionsToCatalog(
      convexClient,
      createdProducts,
      subscriptionPlans,
    );

    await verifySubscriptionProducts(convexClient);
  } catch (error) {
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSubscriptions()
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Subscription seeding completed successfully!');
      }
      process.exit(0);
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unexpected error occurred', error);
      }
      process.exit(1);
    });
}
