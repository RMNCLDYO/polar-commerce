import {
  createClient,
  type GenericCtx,
  getStaticAuth,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { requireActionCtx } from '@convex-dev/better-auth/utils';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import {
  anonymous,
  emailOTP,
  genericOAuth,
  magicLink,
  twoFactor,
  username,
} from 'better-auth/plugins';
import { components, internal } from '../_generated/api';
import type { DataModel } from '../_generated/dataModel';
import { type QueryCtx, query } from '../_generated/server';
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from '../emails/email';
import { polar } from '../polar';

const siteUrl = process.env.SITE_URL;

// @ts-expect-error - Circular type reference with internal.auth
export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions: internal.auth.auth,
  verbose: false,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        // Automatically create Polar customer when user signs up
        console.log(`🔔 [TRIGGER] User created: ${authUser.email}`);

        try {
          await ctx.scheduler.runAfter(0, internal.auth.sync.onUserCreated, {
            userId: authUser._id,
            email: authUser.email,
            name: authUser.name,
          });
          console.log(
            `✅ [TRIGGER] Scheduled Polar customer creation for ${authUser.email}`,
          );
        } catch (error) {
          console.error(
            `❌ [TRIGGER] Failed to schedule Polar customer creation:`,
            error,
          );
          // Don't throw - we don't want to block user creation
        }
      },
      onDelete: async (ctx, authUser) => {
        // Automatically delete Polar customer when user deletes their account
        console.log(`🔔 [TRIGGER] User deleted: ${authUser.email}`);

        try {
          await ctx.scheduler.runAfter(
            0,
            internal.polar.customer.deleteCustomer,
            {
              userId: authUser._id,
            },
          );
          console.log(
            `✅ [TRIGGER] Scheduled Polar customer deletion for ${authUser.email}`,
          );
        } catch (error) {
          console.error(
            `❌ [TRIGGER] Failed to schedule Polar customer deletion:`,
            error,
          );
          // Don't throw - user account already deleted
        }
      },
    },
  },
});

// @ts-expect-error - Circular type reference in return type
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) =>
  betterAuth({
    baseURL: siteUrl,
    logger: {
      disabled: optionsOnly,
    },
    database: authComponent.adapter(ctx),
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireActionCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireActionCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    user: {
      additionalFields: {
        foo: {
          type: 'string',
          required: false,
        },
      },
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      anonymous(),
      username(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink(requireActionCtx(ctx), {
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireActionCtx(ctx), {
            to: email,
            code: otp,
          });
        },
      }),
      twoFactor(),
      genericOAuth({
        config: [
          {
            providerId: 'slack',
            clientId: process.env.SLACK_CLIENT_ID as string,
            clientSecret: process.env.SLACK_CLIENT_SECRET as string,
            discoveryUrl: 'https://slack.com/.well-known/openid-configuration',
            scopes: ['openid', 'email', 'profile'],
          },
        ],
      }),
      convex(),
    ],
  } satisfies BetterAuthOptions);

// Export a static instance for Better Auth schema generation and type inference
// @ts-expect-error - Circular type reference in auth initialization
export const auth = getStaticAuth(createAuth);

// Below are example helpers and functions for getting the current user
// Feel free to edit, omit, etc.
export const safeGetUser = async (ctx: QueryCtx) => {
  return authComponent.safeGetAuthUser(ctx);
};

export const getUser = async (ctx: QueryCtx) => {
  return authComponent.getAuthUser(ctx);
};

// Fast query for header - just returns basic user info without subscription
export const getCurrentUserBasic = query({
  args: {},
  handler: async (ctx) => {
    return await safeGetUser(ctx);
  },
});

// Full query with subscription data - use this on pages that need tier info
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetUser(ctx);
    if (!user) return null;

    // Get subscription data from Polar
    try {
      const subscription = await polar.getCurrentSubscription(ctx, {
        userId: user._id,
      });

      // Determine user tier based on subscription
      let tier: 'free' | 'starter' | 'premium' = 'free';
      const productKey = subscription?.productKey;

      if (productKey) {
        if (productKey === 'starterMonthly' || productKey === 'starterYearly') {
          tier = 'starter';
        } else if (
          productKey === 'premiumMonthly' ||
          productKey === 'premiumYearly'
        ) {
          tier = 'premium';
        }
      }

      return {
        ...user,
        subscription,
        tier,
        isFree: tier === 'free',
        isStarter: tier === 'starter',
        isPremium: tier === 'premium',
      };
    } catch (_error) {
      // If subscription check fails, return user without subscription data
      return {
        ...user,
        subscription: null,
        tier: 'free' as const,
        isFree: true,
        isStarter: false,
        isPremium: false,
      };
    }
  },
});

// Export trigger API functions
export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
