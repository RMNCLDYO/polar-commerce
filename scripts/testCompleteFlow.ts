import { Polar } from "@polar-sh/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

async function testCompleteFlow() {
  console.log(`${colors.bright}${colors.magenta}🧪 TESTING COMPLETE FLOW${colors.reset}`);
  console.log("=" .repeat(60));
  console.log("This test will verify:");
  console.log("  1. We have exactly 4 products in Convex");
  console.log("  2. We have exactly 4 active products in Polar");
  console.log("  3. All products are properly linked");
  console.log("  4. All products have images");
  console.log("  5. Product sync is correct");
  console.log("  6. No duplicate IDs (Convex, Polar, Images)");
  console.log("=" .repeat(60));

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://steady-lynx-728.convex.cloud";
  const convexClient = new ConvexHttpClient(convexUrl);

  const polarToken = process.env.POLAR_ORGANIZATION_TOKEN;
  const polarServer = (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox";

  if (!polarToken) {
    console.error(`${colors.red}❌ POLAR_ORGANIZATION_TOKEN not found${colors.reset}`);
    process.exit(1);
  }

  const polarClient = new Polar({
    accessToken: polarToken,
    server: polarServer,
  });

  try {
    // Test 1: Check Convex products
    console.log(`\n${colors.yellow}TEST 1: Convex Products${colors.reset}`);
    const convexProducts = await convexClient.query(api.products.getProducts, {});
    console.log(`Found: ${convexProducts.length} products`);

    if (convexProducts.length === 4) {
      console.log(`${colors.green}✅ PASS: Exactly 4 products${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Expected 4, got ${convexProducts.length}${colors.reset}`);
    }

    // Test 2: Check Polar products
    console.log(`\n${colors.yellow}TEST 2: Polar Products${colors.reset}`);
    const polarProductsIter = await polarClient.products.list({ limit: 100, isArchived: false });
    const polarProducts: any[] = [];

    for await (const page of polarProductsIter) {
      const items = (page as any).result?.items || [];
      polarProducts.push(...items);
    }

    console.log(`Found: ${polarProducts.length} active products`);

    if (polarProducts.length === 4) {
      console.log(`${colors.green}✅ PASS: Exactly 4 active products${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Expected 4, got ${polarProducts.length}${colors.reset}`);
    }

    // Test 3: Check linking
    console.log(`\n${colors.yellow}TEST 3: Product Linking${colors.reset}`);
    let allLinked = true;
    const linkMap = new Map();

    for (const product of convexProducts) {
      if (product.polarProductId) {
        linkMap.set(product.name, product.polarProductId);
        console.log(`✅ ${product.name} → ${product.polarProductId}`);
      } else {
        allLinked = false;
        console.log(`❌ ${product.name} → Not linked`);
      }
    }

    if (allLinked) {
      console.log(`${colors.green}✅ PASS: All products are linked${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Some products are not linked${colors.reset}`);
    }

    // Test 4: Check images
    console.log(`\n${colors.yellow}TEST 4: Product Images${colors.reset}`);
    let allHaveImages = true;

    for (const product of polarProducts) {
      const hasImage = product.medias && product.medias.length > 0;
      if (hasImage) {
        const imageUrl = product.medias[0].publicUrl || product.medias[0].public_url || "No URL";
        console.log(`✅ ${product.name} has image`);
      } else {
        allHaveImages = false;
        console.log(`❌ ${product.name} has no image`);
      }
    }

    if (allHaveImages) {
      console.log(`${colors.green}✅ PASS: All products have images${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Some products don't have images${colors.reset}`);
    }

    // Test 5: Verify correct products and sync
    console.log(`\n${colors.yellow}TEST 5: Verify Product Sync${colors.reset}`);
    const expectedProducts = [
      "Nike ZoomX Vomero Plus",
      "Nike Club Cap",
      "Nike Tech Woven Pants",
      "Jordan Fleece Hoodie"
    ];

    let allCorrect = true;
    for (const expectedName of expectedProducts) {
      const convexProduct = convexProducts.find(p => p.name === expectedName);
      const polarProduct = polarProducts.find(p => p.name === expectedName);

      if (convexProduct && polarProduct) {
        const synced = convexProduct.polarProductId === polarProduct.id;
        if (synced) {
          console.log(`✅ ${expectedName}: Properly synced`);
        } else {
          allCorrect = false;
          console.log(`❌ ${expectedName}: IDs don't match`);
        }
      } else {
        allCorrect = false;
        console.log(`❌ ${expectedName}: Missing in ${!convexProduct ? "Convex" : "Polar"}`);
      }
    }

    if (allCorrect) {
      console.log(`${colors.green}✅ PASS: All products correctly synced${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Sync issues detected${colors.reset}`);
    }

    // Test 6: Check for duplicate Convex IDs
    console.log(`\n${colors.yellow}TEST 6: No Duplicate Convex IDs${colors.reset}`);
    const convexIds = convexProducts.map(p => p.id);
    const uniqueConvexIds = new Set(convexIds);
    const noDuplicateConvexIds = convexIds.length === uniqueConvexIds.size;

    if (noDuplicateConvexIds) {
      console.log(`${colors.green}✅ PASS: All ${convexIds.length} Convex IDs are unique${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Found duplicate Convex IDs${colors.reset}`);
      const duplicates = convexIds.filter((id, index) => convexIds.indexOf(id) !== index);
      console.log(`   Duplicates: ${duplicates.join(", ")}`);
    }

    // Test 7: Check for duplicate Polar IDs
    console.log(`\n${colors.yellow}TEST 7: No Duplicate Polar IDs${colors.reset}`);
    const polarIds = polarProducts.map(p => p.id);
    const uniquePolarIds = new Set(polarIds);
    const noDuplicatePolarIds = polarIds.length === uniquePolarIds.size;

    if (noDuplicatePolarIds) {
      console.log(`${colors.green}✅ PASS: All ${polarIds.length} Polar IDs are unique${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Found duplicate Polar IDs${colors.reset}`);
      const duplicates = polarIds.filter((id, index) => polarIds.indexOf(id) !== index);
      console.log(`   Duplicates: ${duplicates.join(", ")}`);
    }

    // Test 8: Check for duplicate Polar links in Convex
    console.log(`\n${colors.yellow}TEST 8: No Duplicate Polar Links${colors.reset}`);
    const linkedPolarIds = convexProducts
      .map(p => p.polarProductId)
      .filter(id => id); // Filter out undefined/null
    const uniqueLinkedIds = new Set(linkedPolarIds);
    const noDuplicateLinks = linkedPolarIds.length === uniqueLinkedIds.size;

    if (noDuplicateLinks) {
      console.log(`${colors.green}✅ PASS: All ${linkedPolarIds.length} Polar links are unique${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Multiple Convex products link to same Polar product${colors.reset}`);
      const duplicates = linkedPolarIds.filter((id, index) => linkedPolarIds.indexOf(id) !== index);
      console.log(`   Duplicate links: ${duplicates.join(", ")}`);
    }

    // Test 9: Check for duplicate image IDs
    console.log(`\n${colors.yellow}TEST 9: No Duplicate Image IDs${colors.reset}`);
    const imageIds: string[] = [];
    for (const product of polarProducts) {
      if (product.medias && product.medias.length > 0) {
        imageIds.push(...product.medias.map((m: any) => m.id));
      }
    }
    const uniqueImageIds = new Set(imageIds);
    const noDuplicateImageIds = imageIds.length === uniqueImageIds.size;

    if (noDuplicateImageIds) {
      console.log(`${colors.green}✅ PASS: All ${imageIds.length} image IDs are unique${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Found duplicate image IDs${colors.reset}`);
      const duplicates = imageIds.filter((id, index) => imageIds.indexOf(id) !== index);
      console.log(`   Duplicates: ${duplicates.join(", ")}`);
    }

    // Test 10: Check for duplicate product names
    console.log(`\n${colors.yellow}TEST 10: No Duplicate Product Names${colors.reset}`);
    const productNames = convexProducts.map(p => p.name);
    const uniqueNames = new Set(productNames);
    const noDuplicateNames = productNames.length === uniqueNames.size;

    if (noDuplicateNames) {
      console.log(`${colors.green}✅ PASS: All ${productNames.length} product names are unique${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL: Found duplicate product names${colors.reset}`);
      const duplicates = productNames.filter((name, index) => productNames.indexOf(name) !== index);
      console.log(`   Duplicates: ${duplicates.join(", ")}`);
    }

    // Final Summary
    console.log(`\n${colors.bright}${colors.cyan}📊 FINAL SUMMARY${colors.reset}`);
    console.log("=" .repeat(60));

    const tests = [
      convexProducts.length === 4,
      polarProducts.length === 4,
      allLinked,
      allHaveImages,
      allCorrect,
      noDuplicateConvexIds,
      noDuplicatePolarIds,
      noDuplicateLinks,
      noDuplicateImageIds,
      noDuplicateNames
    ];

    const passed = tests.filter(t => t).length;
    const total = tests.length;

    if (passed === total) {
      console.log(`${colors.bright}${colors.green}🎉 ALL TESTS PASSED! (${passed}/${total})${colors.reset}`);
      console.log(`${colors.green}✅ Your Polar integration is working perfectly!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  SOME TESTS FAILED (${passed}/${total})${colors.reset}`);
    }

    // Show one product details as example
    console.log(`\n${colors.cyan}📦 Example Product Details:${colors.reset}`);
    const exampleProduct = convexProducts[0];
    const polarExample = polarProducts.find(p => p.id === exampleProduct.polarProductId);

    if (exampleProduct && polarExample) {
      console.log(`\nProduct: ${exampleProduct.name}`);
      console.log(`  Convex ID: ${exampleProduct.id}`);
      console.log(`  Polar ID: ${exampleProduct.polarProductId}`);
      console.log(`  Price: ${exampleProduct.price}`);
      if (polarExample.medias && polarExample.medias.length > 0) {
        const imageUrl = polarExample.medias[0].publicUrl || polarExample.medias[0].public_url;
        console.log(`  Image: ${imageUrl}`);
      }
    }

  } catch (error: any) {
    console.error(`\n${colors.red}❌ Test Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run test
testCompleteFlow()
  .then(() => {
    console.log(`\n${colors.green}✅ Test complete!${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });