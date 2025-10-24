/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  type GenericCtx,
  createClient,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import {
  anonymous,
  emailOTP,
  magicLink,
  twoFactor,
  username,
} from 'better-auth/plugins';
import { v } from 'convex/values';
import { components, internal } from '../_generated/api';
import type { DataModel } from '../_generated/dataModel';
import { type QueryCtx, query } from '../_generated/server';
import { polar } from '../polar';
import type { CurrentUser } from '../types/convex';

const siteUrl = process.env.SITE_URL;
const isProduction = !!process.env.CONVEX_CLOUD_URL;

if (!siteUrl) {
  throw new Error('SITE_URL environment variable is required for Better Auth');
}

if (isProduction && !siteUrl.startsWith('https://')) {
  throw new Error('SITE_URL must use HTTPS in production');
}

// OAuth provider configuration with safety checks
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

// In production, throw if providers are partially configured
if (isProduction) {
  if ((githubClientId && !githubClientSecret) || (!githubClientId && githubClientSecret)) {
    throw new Error('GitHub OAuth requires both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
  }
}

// Feature flags
const enableAnonymous = process.env.ENABLE_ANONYMOUS_AUTH === 'true' || !isProduction;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: false,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        try {
          // @ts-ignore - TypeScript deep instantiation issue with Convex internal API (intermittent) - eslint-disable-line @typescript-eslint/ban-ts-comment
          await ctx.scheduler.runAfter(0, internal.auth.sync.onUserCreated, {
            userId: authUser._id,
            email: authUser.email,
            name: authUser.name,
          });
        } catch (error) {
          console.error('onUserCreated trigger failed', {
            userId: authUser._id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      onDelete: async (ctx, authUser) => {
        try {
          // @ts-ignore - TypeScript issue with ctx.scheduler type
          await ctx.scheduler.runAfter(
            0,
            components.polar.lib.deleteCustomer,
            {
              userId: authUser._id,
            },
          );
        } catch (error) {
          console.error('onUserDelete trigger failed', {
            userId: authUser._id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
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
        allowDifferentEmails: false,
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        // @ts-ignore - TypeScript issue with ctx.scheduler type
        await ctx.scheduler.runAfter(0, internal.emails.email.internal_sendEmailVerification, {
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      sendResetPassword: async ({ user, url }) => {
        // @ts-ignore - TypeScript issue with ctx.scheduler type
        await ctx.scheduler.runAfter(0, internal.emails.email.internal_sendResetPassword, {
          to: user.email,
          url,
        });
      },
    },
    socialProviders: {
      ...(githubClientId && githubClientSecret
        ? {
            github: {
              clientId: githubClientId,
              clientSecret: githubClientSecret,
            },
          }
        : {}),
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day - refresh session if older than this
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes - cache session in cookie for this long
      },
    },
    rateLimit: {
      enabled: true,
      window: 60, // 60 seconds
      max: 100, // 100 requests per window
      storage: 'database', // Use Convex database for rate limiting
      customRules: {
        '/sign-in/email': {
          window: 10,
          max: 3, // Only 3 login attempts per 10 seconds
        },
        '/sign-up/email': {
          window: 60,
          max: 5, // Only 5 signups per minute
        },
        '/reset-password': {
          window: 60,
          max: 3, // Only 3 password reset requests per minute
        },
        '/send-verification-email': {
          window: 60,
          max: 3, // Only 3 verification emails per minute
        },
      },
    },
    advanced: {
      useSecureCookies: true, // Always use secure cookies since dev runs with HTTPS
      defaultCookieAttributes: {
        httpOnly: true,
        secure: true, // Always secure since dev runs with HTTPS
        sameSite: 'lax',
      },
    },
    plugins: [
      ...(enableAnonymous ? [anonymous()] : []),
      username(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          // @ts-ignore - TypeScript issue with ctx.scheduler type
          await ctx.scheduler.runAfter(0, internal.emails.email.internal_sendMagicLink, {
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          // @ts-ignore - TypeScript issue with ctx.scheduler type
          await ctx.scheduler.runAfter(0, internal.emails.email.internal_sendOTPVerification, {
            to: email,
            code: otp,
          });
        },
      }),
      twoFactor(),
      convex(),
    ],
  } satisfies BetterAuthOptions);


export const safeGetUser = async (ctx: QueryCtx) => {
  return authComponent.safeGetAuthUser(ctx);
};

export const getUser = async (ctx: QueryCtx) => {
  return authComponent.getAuthUser(ctx);
};

export const getCurrentUserBasic = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await safeGetUser(ctx);
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx): Promise<CurrentUser | null> => {
    const user = await safeGetUser(ctx);
    if (!user) { return null; }

    try {
      const subscription = await polar.getCurrentSubscription(ctx, {
        userId: user._id,
      });

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

export const isAdmin = async (ctx: QueryCtx): Promise<boolean> => {
  const user = await safeGetUser(ctx);
  if (!user?.email) {
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(user.email);
};

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
