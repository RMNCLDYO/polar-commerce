import {
  type GenericCtx,
  createClient,
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
import type { CurrentUser } from '../types/convex';
import { logger } from '../utils/logger';

const siteUrl = process.env.SITE_URL;


export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: false,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        logger.info(`[TRIGGER] User created: ${authUser.email}`);

        try {
          // @ts-ignore - TypeScript deep instantiation issue with Convex
          await ctx.scheduler.runAfter(0, internal.auth.sync.onUserCreated, {
            userId: authUser._id,
            email: authUser.email,
            name: authUser.name,
          });
          logger.info(
            `[TRIGGER] Scheduled Polar customer creation for ${authUser.email}`,
          );
        } catch (error) {
          logger.error(
            `[TRIGGER] Failed to schedule Polar customer creation:`,
            error,
          );
        }
      },
      onDelete: async (ctx, authUser) => {
        logger.info(`[TRIGGER] User deleted: ${authUser.email}`);

        try {
          await ctx.scheduler.runAfter(
            0,
            components.polar.lib.deleteCustomer,
            {
              userId: authUser._id,
            },
          );
          logger.info(
            `[TRIGGER] Scheduled Polar customer deletion for ${authUser.email}`,
          );
        } catch (error) {
          logger.error(
            `[TRIGGER] Failed to schedule Polar customer deletion:`,
            error,
          );
        }
      },
    },
  },
});

// Create auth instance with proper types
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
  handler: async (ctx): Promise<CurrentUser | null> => {
    const user = await safeGetUser(ctx);
    if (!user) { return null; }

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
    } catch {
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

// Admin check helper
export const isAdmin = async (ctx: QueryCtx): Promise<boolean> => {
  const user = await safeGetUser(ctx);
  if (!user?.email) {
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(user.email);
};

// Export trigger API functions
export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
