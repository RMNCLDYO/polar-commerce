import { Polar } from '@polar-sh/sdk';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import type {
  ConvexProduct,
  PageIteratorResponse,
  PolarFile,
  PolarProduct,
  ProcessedProduct,
  Product,
} from './types';

dotenv.config({ path: '.env.local' });

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

function loadProductsFromFile(): Product[] {
  const productsPath = join(process.cwd(), 'data', 'products.json');
  const productsData = readFileSync(productsPath, 'utf-8');
  return JSON.parse(productsData) as Product[];
}

async function fetchExistingPolarProducts(
  polarClient: Polar,
): Promise<PolarProduct[]> {
  const productsIter = await polarClient.products.list({ limit: 100 });
  const existingProducts: PolarProduct[] = [];

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

      existingProducts.push(
        ...items.filter((p) => !p.isArchived && !p.is_archived),
      );
    }
  }

  return existingProducts;
}

async function createOrUpdatePolarProduct(
  polarClient: Polar,
  product: Product,
  existingProduct: PolarProduct | undefined,
): Promise<PolarProduct> {
  if (existingProduct) {
    return await polarClient.products.update({
      id: existingProduct.id,
      productUpdate: {
        name: product.name,
        description: product.description,
      },
    });
  }
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

async function createOrUpdateConvexProduct(
  convexClient: ConvexHttpClient,
  product: Product,
  polarProductId: string,
  polarImageUrl: string | undefined,
  polarImageId: string,
  existingProduct: ConvexProduct | undefined,
): Promise<string> {
  if (existingProduct) {
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

export async function seedProducts(): Promise<void> {
  const env = validateEnvironment();
  const polarClient = new Polar({
    accessToken: env.token,
    server: env.server,
  });
  const convexClient = new ConvexHttpClient(env.convexUrl);

  try {
    const products = loadProductsFromFile();
    const existingPolarProducts = await fetchExistingPolarProducts(polarClient);

    const existingConvexProducts = (await convexClient.query(
      api.catalog.catalog.getAllProductsRaw,
      {},
    )) as ConvexProduct[];

    const processedProducts: ProcessedProduct[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) continue;

      try {
        const existingPolarProduct = existingPolarProducts.find(
          (p) => p.name === product.name,
        );

        const polarProduct = await createOrUpdatePolarProduct(
          polarClient,
          product,
          existingPolarProduct,
        );

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

        await polarClient.products.update({
          id: polarProduct.id,
          productUpdate: {
            medias: [uploadedFile.id],
          },
        });

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

        processedProducts.push({
          name: product.name,
          polarId: polarProduct.id,
          convexId,
        });
      } catch (error) {
        console.error('Failed to create product:', error);
      }
    }

    await convexClient.query(
      api.catalog.catalog.getAllProductsRaw,
      {},
    );
  } catch (error) {
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts()
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Product seeding completed successfully!');
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
