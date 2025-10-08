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

interface Product {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  inStock: boolean;
  inventory_qty: number;
}

async function seedProducts() {
  console.log(
    `${colors.bright}${colors.magenta}🚀 SEEDING PRODUCTS${colors.reset}`,
  );
  console.log('='.repeat(70));

  const token = process.env.POLAR_ORGANIZATION_TOKEN;
  const server =
    (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

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
    // Load products from JSON file
    const productsPath = join(process.cwd(), 'products.json');
    const products: Product[] = JSON.parse(readFileSync(productsPath, 'utf-8'));

    console.log(
      `${colors.cyan}📦 Found ${products.length} products to process${colors.reset}\n`,
    );

    // STEP 1: Fetch existing products
    console.log(
      `${colors.yellow}🔍 Step 1: Checking existing products...${colors.reset}`,
    );

    const polarProductsIter = await polarClient.products.list({ limit: 100 });
    const existingPolarProducts: any[] = [];
    for await (const response of polarProductsIter) {
      const items = (response as any).result?.items || [];
      existingPolarProducts.push(
        ...items.filter((p: any) => !p.isArchived && !p.is_archived),
      );
    }
    console.log(
      `  Found ${existingPolarProducts.length} existing Polar products`,
    );

    const existingConvexProducts = await convexClient.query(
      api.products.getAllProductsRaw,
      {},
    );
    console.log(
      `  Found ${existingConvexProducts.length} existing Convex products\n`,
    );

    // STEP 2: Process each product
    console.log(
      `${colors.yellow}📋 Step 2: Processing products...${colors.reset}\n`,
    );

    const processedProducts: {
      name: string;
      polarId: string;
      convexId: string;
    }[] = [];

    for (const product of products) {
      console.log(`${colors.bright}Processing: ${product.name}${colors.reset}`);
      console.log(`  Category: ${product.category}`);
      console.log(`  Price: $${(product.price / 100).toFixed(2)}`);

      try {
        // Check/Create in Polar
        const existingPolarProduct = existingPolarProducts.find(
          (p: any) => p.name === product.name,
        );

        let polarProduct: any;
        if (existingPolarProduct) {
          console.log(
            `  ${colors.yellow}✓ Polar product exists, updating...${colors.reset}`,
          );
          polarProduct = await polarClient.products.update({
            id: existingPolarProduct.id,
            productUpdate: {
              name: product.name,
              description: product.description,
            },
          });
        } else {
          console.log(
            `  ${colors.cyan}Creating new Polar product...${colors.reset}`,
          );
          polarProduct = await polarClient.products.create({
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
        console.log(
          `  ${colors.green}✓ Polar product ready (ID: ${polarProduct.id})${colors.reset}`,
        );

        // Upload image to Polar
        console.log(
          `  ${colors.cyan}Uploading product image...${colors.reset}`,
        );

        let imageBuffer: Buffer;
        let fileName: string;

        // Try to load from local filesystem first
        try {
          const imagePath = join(process.cwd(), 'public', product.imageUrl);
          imageBuffer = readFileSync(imagePath);
          fileName = product.imageUrl.split('/').pop() || 'image.jpeg';
        } catch {
          // Fall back to fetching from URL
          const imageUrl = `${siteUrl}${product.imageUrl}`;
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          imageBuffer = Buffer.from(imageArrayBuffer);
          fileName = product.imageUrl.split('/').pop() || 'image.jpeg';
        }

        const fileSize = imageBuffer.length;
        const sha256Hash = createHash('sha256')
          .update(imageBuffer)
          .digest('base64');

        const createResponse = await polarClient.files.create({
          name: fileName,
          mimeType: 'image/jpeg',
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
          'Content-Type': 'image/jpeg',
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
          id: polarProduct.id,
          productUpdate: {
            medias: [uploadedFile.id],
          },
        });
        console.log(
          `  ${colors.green}✓ Image linked to product${colors.reset}`,
        );

        // Add/Update in Convex
        const existingConvexProduct = existingConvexProducts.find(
          (p: any) => p.name === product.name,
        );

        const polarImageUrl =
          'publicUrl' in uploadedFile ? uploadedFile.publicUrl : undefined;
        let convexId: string;

        if (existingConvexProduct) {
          console.log(
            `  ${colors.yellow}✓ Convex product exists, updating...${colors.reset}`,
          );
          await convexClient.mutation(api.products.updateProduct, {
            productId: existingConvexProduct._id,
            updates: {
              price: product.price,
              category: product.category,
              imageUrl: product.imageUrl,
              description: product.description,
              polarProductId: polarProduct.id,
              polarImageUrl: polarImageUrl,
              polarImageId: uploadedFile.id,
              inStock: product.inStock,
              inventory_qty: product.inventory_qty,
            },
          });
          convexId = existingConvexProduct._id;
        } else {
          console.log(
            `  ${colors.cyan}Creating new Convex product...${colors.reset}`,
          );
          convexId = await convexClient.mutation(api.products.createProduct, {
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            description: product.description,
            polarProductId: polarProduct.id,
            polarImageUrl: polarImageUrl,
            polarImageId: uploadedFile.id,
            inStock: product.inStock,
            inventory_qty: product.inventory_qty,
          });
        }

        console.log(
          `  ${colors.green}✓ Convex product ready (ID: ${convexId})${colors.reset}`,
        );
        console.log(
          `  ${colors.bright}${colors.green}✅ Product complete!${colors.reset}\n`,
        );

        processedProducts.push({
          name: product.name,
          polarId: polarProduct.id,
          convexId: convexId,
        });
      } catch (error: any) {
        console.error(
          `  ${colors.red}❌ Error: ${error.message}${colors.reset}\n`,
        );
      }
    }

    // STEP 3: Verification
    console.log(
      `${colors.yellow}✅ Step 3: Verifying product sync...${colors.reset}`,
    );

    const finalConvexProducts = await convexClient.query(
      api.products.getAllProductsRaw,
      {},
    );
    console.log(
      `  ${colors.green}✓ Total products in Convex: ${finalConvexProducts.length}${colors.reset}`,
    );

    const syncedCount = finalConvexProducts.filter(
      (p: any) => p.polarProductId,
    ).length;
    const imagesCount = finalConvexProducts.filter(
      (p: any) => p.polarImageUrl,
    ).length;

    console.log(
      `  ${colors.green}✓ Products linked to Polar: ${syncedCount}/${finalConvexProducts.length}${colors.reset}`,
    );
    console.log(
      `  ${colors.green}✓ Products with images: ${imagesCount}/${finalConvexProducts.length}${colors.reset}`,
    );

    // Display summary
    console.log('\n' + '='.repeat(70));
    console.log(
      `${colors.bright}${colors.green}✅ PRODUCT SEEDING COMPLETE!${colors.reset}`,
    );
    console.log('='.repeat(70) + '\n');

    console.log('Processed Products:');
    console.log('─'.repeat(70));
    processedProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Polar ID: ${p.polarId}`);
      console.log(`   Convex ID: ${p.convexId}`);
      console.log();
    });

    console.log('─'.repeat(70));
    console.log('Product Status:');
    finalConvexProducts.forEach((p: any) => {
      const hasImage = p.polarImageUrl ? '✅' : '❌';
      const hasLink = p.polarProductId ? '✅' : '❌';
      console.log(`  ${hasLink} Linked  ${hasImage} Image  - ${p.name}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('Next steps:');
    console.log('  1. Verify products in Polar dashboard');
    console.log("  2. Test product pages with 'npm run dev'");
    console.log('  3. Check image display on /shop page');
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
seedProducts()
  .then(() => {
    console.log(
      `\n${colors.green}✨ Product seeding completed successfully!${colors.reset}`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${colors.red}❌ Unexpected error:${colors.reset}`, error);
    process.exit(1);
  });
