/**
 * Product Seeding Script for Next.js 16
 * Handles seeding of products from JSON data to Polar API and Convex database
 *
 * @requires Node.js 20.9+
 * @requires TypeScript 5+
 */

import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { createLogger } from './logger';
import type {
  ConvexProduct,
  PageIteratorResponse,
  PolarFile,
  PolarProduct,
  ProcessedProduct,
  Product,
} from './types';

dotenv.config({ path: '.env.local' });

const logger = createLogger({ prefix: '📦' });

/**
 * Validates required environment variables
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment(): {
  token: string;
  server: 'sandbox' | 'production';
  convexUrl: string;
  siteUrl: string;
} {
  const token = process.env.POLAR_ORGANIZATION_TOKEN;
  const server =
    (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  if (!token) {
    throw new Error('POLAR_ORGANIZATION_TOKEN not found in environment');
  }

  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL not found in environment');
  }

  return { token, server, convexUrl, siteUrl };
}

/**
 * Loads products from JSON data file
 * @returns {Product[]} Array of products to seed
 */
function loadProductsFromFile(): Product[] {
  const productsPath = join(process.cwd(), 'data', 'products.json');
  const productsData = readFileSync(productsPath, 'utf-8');
  return JSON.parse(productsData) as Product[];
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
 * Creates or updates a product in Polar
 */
async function createOrUpdatePolarProduct(
  polarClient: Polar,
  product: Product,
  existingProduct: PolarProduct | undefined,
): Promise<PolarProduct> {
  if (existingProduct) {
    logger.info(`Updating existing Polar product: ${product.name}`);
    return await polarClient.products.update({
      id: existingProduct.id,
      productUpdate: {
        name: product.name,
        description: product.description,
      },
    });
  }

  logger.info(`Creating new Polar product: ${product.name}`);
  return await polarClient.products.create({
    name: product.name,
    description: product.description,
    prices: [
      {
        amountType: 'fixed',
        priceAmount: product.price,
        priceCurrency: 'usd',
      },
    ],
  });
}

/**
 * Uploads an image file to Polar S3
 */
async function uploadImageToPolar(
  polarClient: Polar,
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<PolarFile> {
  const fileSize = imageBuffer.length;
  const sha256Hash = createHash('sha256').update(imageBuffer).digest('base64');

  const createResponse = await polarClient.files.create({
    name: fileName,
    mimeType,
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
      'Content-Type': mimeType,
      ...part.headers,
    },
    body: imageBuffer,
  });

  if (!s3Response.ok) {
    throw new Error(`S3 upload failed with status: ${s3Response.status}`);
  }

  const etag = s3Response.headers.get('etag')?.replace(/"/g, '') ?? '';

  return (await polarClient.files.uploaded({
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
  })) as PolarFile;
}

/**
 * Loads product image from filesystem or URL
 */
async function loadProductImage(
  product: Product,
  siteUrl: string,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  try {
    const imagePath = join(process.cwd(), 'public', product.imageUrl);
    const buffer = readFileSync(imagePath);
    const fileName = product.imageUrl.split('/').pop() ?? 'image.jpeg';
    const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return { buffer, fileName, mimeType };
  } catch {
    const imageUrl = `${siteUrl}${product.imageUrl}`;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageArrayBuffer);
    const fileName = product.imageUrl.split('/').pop() ?? 'image.jpeg';
    const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return { buffer, fileName, mimeType };
  }
}

/**
 * Creates or updates a product in Convex
 */
async function createOrUpdateConvexProduct(
  convexClient: ConvexHttpClient,
  product: Product,
  polarProductId: string,
  polarImageUrl: string | undefined,
  polarImageId: string,
  existingProduct: ConvexProduct | undefined,
): Promise<string> {
  if (existingProduct) {
    logger.info(`Updating existing Convex product: ${product.name}`);
    await convexClient.mutation(api.catalog.catalog.updateProduct, {
      productId: existingProduct._id as Id<'catalog'>,
      updates: {
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        description: product.description,
        polarProductId,
        polarImageUrl,
        polarImageId,
        inStock: product.inStock,
        inventory_qty: product.inventory_qty,
      },
    });
    return existingProduct._id;
  }

  logger.info(`Creating new Convex product: ${product.name}`);
  return (await convexClient.mutation(api.catalog.catalog.createProduct, {
    name: product.name,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    description: product.description,
    polarProductId,
    polarImageUrl,
    polarImageId,
    inStock: product.inStock,
    inventory_qty: product.inventory_qty,
  })) as string;
}

/**
 * Main seeding function for products
 */
export async function seedProducts(): Promise<void> {
  logger.section('🚀 SEEDING PRODUCTS');

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
    const products = loadProductsFromFile();
    logger.success(`Found ${products.length} products to process`);
    logger.blank();

    logger.step(1, 'Checking existing products...');
    const existingPolarProducts = await fetchExistingPolarProducts(polarClient);
    logger.item('Polar products', existingPolarProducts.length);

    const existingConvexProducts = (await convexClient.query(
      api.catalog.catalog.getAllProductsRaw,
      {},
    )) as ConvexProduct[];
    logger.item('Convex products', existingConvexProducts.length);
    logger.blank();

    logger.step(2, 'Processing products...');
    logger.blank();

    const processedProducts: ProcessedProduct[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) continue;

      logger.progress(i + 1, products.length, product.name);
      logger.item('Category', product.category);
      logger.item('Price', `$${(product.price / 100).toFixed(2)}`);

      try {
        const existingPolarProduct = existingPolarProducts.find(
          (p) => p.name === product.name,
        );

        const polarProduct = await createOrUpdatePolarProduct(
          polarClient,
          product,
          existingPolarProduct,
        );
        logger.success(`Polar product ready (ID: ${polarProduct.id})`);

        logger.info('Uploading product image...');
        const { buffer, fileName, mimeType } = await loadProductImage(
          product,
          env.siteUrl,
        );
        const uploadedFile = await uploadImageToPolar(
          polarClient,
          buffer,
          fileName,
          mimeType,
        );
        logger.success('Image uploaded successfully');

        await polarClient.products.update({
          id: polarProduct.id,
          productUpdate: {
            medias: [uploadedFile.id],
          },
        });
        logger.success('Image linked to product');

        const existingConvexProduct = existingConvexProducts.find(
          (p) => p.name === product.name,
        );

        const convexId = await createOrUpdateConvexProduct(
          convexClient,
          product,
          polarProduct.id,
          uploadedFile.publicUrl,
          uploadedFile.id,
          existingConvexProduct,
        );
        logger.success(`Convex product ready (ID: ${convexId})`);
        logger.blank();

        processedProducts.push({
          name: product.name,
          polarId: polarProduct.id,
          convexId,
        });
      } catch (error) {
        logger.error(`Failed to process ${product.name}`, error);
        logger.blank();
      }
    }

    logger.step(3, 'Verifying product sync...');
    const finalConvexProducts = (await convexClient.query(
      api.catalog.catalog.getAllProductsRaw,
      {},
    )) as ConvexProduct[];

    const syncedCount = finalConvexProducts.filter(
      (p) => p.polarProductId,
    ).length;
    const imagesCount = finalConvexProducts.filter(
      (p) => p.polarImageUrl,
    ).length;

    logger.success(`Total products in Convex: ${finalConvexProducts.length}`);
    logger.success(
      `Products linked to Polar: ${syncedCount}/${finalConvexProducts.length}`,
    );
    logger.success(
      `Products with images: ${imagesCount}/${finalConvexProducts.length}`,
    );

    logger.separator();
    logger.section('✅ PRODUCT SEEDING COMPLETE!');
    logger.separator();
    logger.blank();

    logger.subsection('Processed Products:');
    logger.divider();
    processedProducts.forEach((p, i) => {
      logger.debug(`${i + 1}. ${p.name}`);
      logger.item('Polar ID', p.polarId);
      logger.item('Convex ID', p.convexId);
      logger.blank();
    });

    logger.divider();
    logger.subsection('Product Status:');
    finalConvexProducts.forEach((p) => {
      const hasImage = p.polarImageUrl ? '✅' : '❌';
      const hasLink = p.polarProductId ? '✅' : '❌';
      logger.debug(`  ${hasLink} Linked  ${hasImage} Image  - ${p.name}`);
    });

    logger.separator();
    logger.subsection('Next steps:');
    logger.list([
      'Verify products in Polar dashboard',
      "Test product pages with 'npm run dev'",
      'Check image display on /shop page',
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
  seedProducts()
    .then(() => {
      logger.success('✨ Product seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Unexpected error occurred', error);
      process.exit(1);
    });
}
