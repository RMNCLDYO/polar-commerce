import { Polar } from "@polar-sh/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

async function deleteAllConvexProducts(convexClient: ConvexHttpClient) {
  console.log(`\n${colors.yellow}📦 Deleting all Convex products...${colors.reset}`);

  try {
    const products = await convexClient.query(api.products.getProducts, {});
    console.log(`  Found ${products.length} products to delete`);

    for (const product of products) {
      await convexClient.mutation(api.products.deleteProduct, {
        productId: product.id as any,
      });
      console.log(`  ❌ Deleted: ${product.name}`);
    }

    console.log(`${colors.green}  ✅ All Convex products deleted${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}  ❌ Error deleting Convex products:${colors.reset}`, error);
    throw error;
  }
}

async function deleteAllPolarProducts(environment: "production" | "sandbox") {
  console.log(`\n${colors.yellow}🧹 Deleting all Polar ${environment} products...${colors.reset}`);

  const token = environment === "production"
    ? "polar_oat_a2rSUtZLfFILSfaNM6weoNq1bz4PBRTI2TzzH0NalZw"
    : "polar_oat_vthER5Ec1hAfO9bOUHWRRgcs8EFtWWhZvF2y51J9vox";

  const polarClient = new Polar({
    accessToken: token,
    server: environment,
  });

  try {
    const productsIter = await polarClient.products.list({ limit: 100 });
    const products: any[] = [];

    for await (const page of productsIter) {
      const items = (page as any).result?.items || [];
      products.push(...items);
    }

    console.log(`  Found ${products.length} products in Polar ${environment}`);

    for (const product of products) {
      try {
        await polarClient.products.update({
          id: product.id,
          productUpdate: {
            isArchived: true,
          },
        });
        console.log(`  🗑️  Archived: ${product.name}`);
      } catch (err) {
        console.log(`  ⚠️  Could not archive ${product.name}:`, err);
      }
    }

    console.log(`${colors.green}  ✅ All Polar ${environment} products archived${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}  ❌ Error with Polar ${environment}:${colors.reset}`, error);
  }
}

async function main() {
  console.log(`${colors.bright}${colors.magenta}🔄 COMPLETE PRODUCT RESET${colors.reset}`);
  console.log("=" .repeat(50));
  console.log("This will delete ALL products from:");
  console.log("  • Convex Database");
  console.log("  • Polar Production");
  console.log("  • Polar Sandbox");
  console.log("=" .repeat(50));

  // Initialize Convex client (use the correct deployment)
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://steady-lynx-728.convex.cloud";
  const convexClient = new ConvexHttpClient(convexUrl);

  try {
    // Step 1: Delete all Convex products
    await deleteAllConvexProducts(convexClient);

    // Step 2: Delete all Polar Production products
    await deleteAllPolarProducts("production");

    // Step 3: Delete all Polar Sandbox products
    await deleteAllPolarProducts("sandbox");

    console.log(`\n${colors.bright}${colors.green}🎉 COMPLETE RESET SUCCESSFUL!${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log("1. Run: npm run products:seed");
    console.log("2. Run: npm run products:verify");

  } catch (error) {
    console.error(`\n${colors.red}❌ Reset failed:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the complete reset
main()
  .then(() => {
    console.log(`\n${colors.green}✨ Ready for fresh seeding!${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });