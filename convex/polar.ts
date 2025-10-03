import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";

export const polar = new Polar(components.polar, {
  // Required: provide a function the component can use to get the current user's ID and email
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }
    return {
      userId: user._id,
      email: user.email,
    };
  },
  // Optional: Configure static keys for referencing your products.
  // Replace these with your actual Polar product IDs from the dashboard
  products: {
    premiumMonthly: process.env.POLAR_PRODUCT_PREMIUM_MONTHLY || "",
    premiumYearly: process.env.POLAR_PRODUCT_PREMIUM_YEARLY || "",
  },
  // Polar configuration from environment variables
  organizationToken: process.env.POLAR_ORGANIZATION_TOKEN,
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
});

// Export API functions from the Polar client
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();
