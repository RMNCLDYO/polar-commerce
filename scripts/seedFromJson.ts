import { Polar } from "@polar-sh/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

interface Product {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
}

async function seedFromJson() {
  console.log(`${colors.bright}${colors.cyan}🚀 SEEDING PRODUCTS FROM JSON${colors.reset}`);
  console.log("=".repeat(60));

  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const polarServer = (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox";
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  if (!polarToken) {
    console.error(`${colors.red}❌ POLAR_ORGANIZATION_TOKEN not found${colors.reset}`);
    process.exit(1);
  }

  if (!convexUrl) {
    console.error(`${colors.red}❌ NEXT_PUBLIC_CONVEX_URL not found${colors.reset}`);
    process.exit(1);
  }

  const polarClient = new Polar({
    accessToken: polarToken,
    server: polarServer,
  });

  const convexClient = new ConvexHttpClient(convexUrl);

  try {
    const productsPath = join(process.cwd(), "products.json");
    const products: Product[] = JSON.parse(readFileSync(productsPath, "utf-8"));

    console.log(`${colors.yellow}📦 Found ${products.length} products to seed${colors.reset}\n`);

    // Fetch existing products from Polar
    console.log(`${colors.cyan}🔍 Fetching existing products...${colors.reset}`);
    const polarProductsIter = await polarClient.products.list({ limit: 100 });
    const existingPolarProducts: any[] = [];
    for await (const response of polarProductsIter) {
      const items = (response as any).result?.items || [];
      // Filter out archived products - check both isArchived and is_archived fields
      existingPolarProducts.push(...items.filter((p: any) => !p.isArchived && !p.is_archived));
    }
    console.log(`  Found ${existingPolarProducts.length} existing Polar products\n`);

    // Fetch existing products from Convex
    const existingConvexProducts = await convexClient.query(api.products.getAllProductsRaw, {});
    console.log(`  Found ${existingConvexProducts.length} existing Convex products\n`);

    for (const product of products) {
      console.log(`${colors.bright}Processing: ${product.name}${colors.reset}`);

      try {
        // Step 1: Check if product exists in Polar, create or update
        const existingPolarProduct = existingPolarProducts.find(
          (p: any) => p.name === product.name
        );

        let polarProduct: any;
        if (existingPolarProduct) {
          console.log(`  ${colors.yellow}1️⃣  Updating existing Polar product...${colors.reset}`);
          polarProduct = await polarClient.products.update({
            id: existingPolarProduct.id,
            productUpdate: {
              name: product.name,
              description: product.description,
            },
          });
          console.log(`  ${colors.green}✅ Updated: ${polarProduct.id}${colors.reset}`);
        } else {
          console.log(`  ${colors.cyan}1️⃣  Creating new product in Polar...${colors.reset}`);
          polarProduct = await polarClient.products.create({
            name: product.name,
            description: product.description,
            prices: [
              {
                amountType: "fixed",
                priceAmount: product.price,
                priceCurrency: "usd",
              },
            ],
          });
          console.log(`  ${colors.green}✅ Created: ${polarProduct.id}${colors.reset}`);
        }

        // Step 2: Upload image to Polar
        console.log(`  ${colors.cyan}2️⃣  Uploading image to Polar...${colors.reset}`);

        let imageBuffer: Buffer;
        let fileName: string;

        // Try to load from local filesystem first
        try {
          const imagePath = join(process.cwd(), "public", product.imageUrl);
          imageBuffer = readFileSync(imagePath);
          fileName = product.imageUrl.split("/").pop() || "image.jpeg";
          console.log(`  ${colors.green}📁 Loaded from: ${imagePath}${colors.reset}`);
        } catch {
          // Fall back to fetching from URL
          const imageUrl = `${siteUrl}${product.imageUrl}`;
          console.log(`  ${colors.yellow}🌐 Fetching from: ${imageUrl}${colors.reset}`);
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          imageBuffer = Buffer.from(imageArrayBuffer);
          fileName = product.imageUrl.split("/").pop() || "image.jpeg";
        }

        const fileSize = imageBuffer.length;
        const sha256Hash = createHash("sha256").update(imageBuffer).digest("base64");

        const createResponse = await polarClient.files.create({
          name: fileName,
          mimeType: "image/jpeg",
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
          service: "product_media",
        });

        if (!createResponse.upload || !("parts" in createResponse.upload) || !createResponse.upload.parts.length) {
          throw new Error("No upload URL returned from Polar");
        }

        const part = createResponse.upload.parts[0];
        const uploadHeaders = {
          "Content-Type": "image/jpeg",
          ...part.headers,
        };

        const s3Response = await fetch(part.url, {
          method: "PUT",
          headers: uploadHeaders,
          body: imageBuffer,
        });

        if (!s3Response.ok) {
          throw new Error(`S3 upload failed: ${s3Response.status} ${await s3Response.text()}`);
        }

        const etag = s3Response.headers.get("etag")?.replace(/"/g, "") || "";

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

        console.log(`  ${colors.green}✅ Uploaded: ${uploadedFile.id}${colors.reset}`);

        // Step 3: Update Polar product with image
        console.log(`  ${colors.cyan}3️⃣  Linking image to product...${colors.reset}`);
        await polarClient.products.update({
          id: polarProduct.id,
          productUpdate: {
            medias: [uploadedFile.id],
          },
        });
        console.log(`  ${colors.green}✅ Linked image${colors.reset}`);

        // Step 4: Add or update product in Convex
        const existingConvexProduct = existingConvexProducts.find(
          (p: any) => p.name === product.name
        );

        const polarImageUrl = "publicUrl" in uploadedFile ? uploadedFile.publicUrl : undefined;

        if (existingConvexProduct) {
          console.log(`  ${colors.yellow}4️⃣  Updating existing Convex product...${colors.reset}`);
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
            },
          });
          console.log(`  ${colors.green}✅ Updated in Convex: ${existingConvexProduct._id}${colors.reset}`);
        } else {
          console.log(`  ${colors.cyan}4️⃣  Creating new product in Convex...${colors.reset}`);
          const convexProductId = await convexClient.mutation(api.products.createProduct, {
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            description: product.description,
            polarProductId: polarProduct.id,
            polarImageUrl: polarImageUrl,
            polarImageId: uploadedFile.id,
          });
          console.log(`  ${colors.green}✅ Created in Convex: ${convexProductId}${colors.reset}`);
        }

        console.log(`  ${colors.green}🎉 Complete!${colors.reset}\n`);

      } catch (error: any) {
        console.error(`  ${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      }
    }

    // Summary
    console.log(`${colors.bright}${colors.green}✅ SEEDING COMPLETE${colors.reset}`);
    console.log("=".repeat(60));

    const convexProducts = await convexClient.query(api.products.getAllProductsRaw, {});
    console.log(`\n📊 Total products in Convex: ${convexProducts.length}`);

    convexProducts.forEach((p: any) => {
      const hasImage = p.polarImageUrl ? "✅" : "❌";
      const hasLink = p.polarProductId ? "✅" : "❌";
      console.log(`  ${hasLink} ${hasImage} ${p.name}`);
    });

  } catch (error: any) {
    console.error(`${colors.red}❌ Fatal Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

seedFromJson()
  .then(() => {
    console.log(`\n${colors.green}✨ Done!${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
