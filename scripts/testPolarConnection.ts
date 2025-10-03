import { Polar } from "@polar-sh/sdk";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testPolarConnection() {
  console.log("🔍 Testing Polar API Connection...\n");

  const token = process.env.POLAR_ORGANIZATION_TOKEN;
  const server = process.env.POLAR_SERVER || "sandbox";

  if (!token) {
    console.error("❌ POLAR_ORGANIZATION_TOKEN not found in .env.local");
    process.exit(1);
  }

  console.log(`Server: ${server}`);
  console.log(`Token: ${token.substring(0, 20)}...${token.substring(token.length - 4)}`);

  try {
    const polarClient = new Polar({
      accessToken: token,
      server: server as "sandbox" | "production",
    });

    console.log("\n📦 Attempting to list products...");
    const productsIter = await polarClient.products.list({ limit: 10 });

    let count = 0;
    const products: any[] = [];

    for await (const response of productsIter) {
      const items = (response as any).result?.items || [];
      products.push(...items);
      count += items.length;
      break; // Just get first page for test
    }

    console.log(`✅ Success! Found ${count} products`);

    if (products.length > 0) {
      console.log("\nFirst few products:");
      products.slice(0, 3).forEach((p: any) => {
        console.log(`  - ${p.name} (${p.id})${p.is_archived ? " [ARCHIVED]" : ""}`);
      });
    }

    // Test organization info
    console.log("\n🏢 Testing organization access...");
    try {
      const organizationsIter = await polarClient.organizations.list({ limit: 1 });
      for await (const response of organizationsIter) {
        const orgs = (response as any).result?.items || [];
        if (orgs.length > 0) {
          console.log(`✅ Organization: ${orgs[0].name} (${orgs[0].id})`);
        }
        break;
      }
    } catch (orgError: any) {
      console.log(`⚠️  Organization list failed (this is okay with organization tokens): ${orgError.message}`);
    }

  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error(`Error: ${error.message}`);

    if (error.message.includes("401") || error.message.includes("invalid_token")) {
      console.error("\n🔑 Token appears to be invalid. Please check:");
      console.error("   1. Token is correct in .env.local");
      console.error("   2. Token has not expired");
      console.error("   3. Token is for the correct environment (sandbox/production)");
    }

    if (error.message.includes("404")) {
      console.error("\n🌐 Server/endpoint issue. Please check:");
      console.error("   1. POLAR_SERVER is set correctly (sandbox/production)");
      console.error("   2. Your Polar account has access to this environment");
    }

    process.exit(1);
  }

  console.log("\n✅ Polar connection test successful!");
  console.log("   Your token and configuration are working correctly.");
}

// Run the test
console.log("🧪 Polar API Connection Test");
console.log("=============================\n");

testPolarConnection()
  .then(() => {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  });