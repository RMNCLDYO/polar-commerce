import type { auth } from "@/convex/betterAuth/auth";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
  anonymousClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    anonymousClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    genericOAuthClient(),
    convexClient(),
  ],
});
