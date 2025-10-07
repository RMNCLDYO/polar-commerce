import {
  createClient,
  GenericCtx,
  getStaticAuth,
  type AuthFunctions,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { requireActionCtx } from '@convex-dev/better-auth/utils';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import {
  anonymous,
  emailOTP,
  genericOAuth,
  magicLink,
  twoFactor,
  username,
} from 'better-auth/plugins';
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from '../convex/email';
import { components, internal } from './_generated/api';
import { DataModel } from './_generated/dataModel';
import { query, QueryCtx } from './_generated/server';
import { polar } from './polar';

const siteUrl = process.env.SITE_URL;

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  verbose: false,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        // Automatically create Polar customer when user signs up
        console.log(`🔔 [TRIGGER] User created: ${authUser.email}`);

        try {
          await ctx.scheduler.runAfter(0, internal.userSync.onUserCreated, {
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
    },
  },
});

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
    } catch (error) {
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
