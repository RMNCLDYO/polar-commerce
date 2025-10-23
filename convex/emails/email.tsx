import '../utils/polyfills';
import { Resend } from '@convex-dev/resend';
import { render } from '@react-email/components';
import { v } from 'convex/values';
// @ts-ignore - React is used implicitly in JSX
import * as React from 'react';
import { components } from '../_generated/api';
import { internalAction, type ActionCtx } from '../_generated/server';
import MagicLinkEmail from './magicLink';
import ResetPasswordEmail from './resetPassword';
import VerifyEmail from './verifyEmail';
import VerifyOTP from './verifyOTP';

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendEmailVerification = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'Test <onboarding@boboddy.business>',
    to,
    subject: 'Verify your email address',
    html: await render(<VerifyEmail url={url} />),
  });
};

export const sendOTPVerification = async (
  ctx: ActionCtx,
  {
    to,
    code,
  }: {
    to: string;
    code: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'Test <onboarding@boboddy.business>',
    to,
    subject: 'Verify your email address',
    html: await render(<VerifyOTP code={code} />),
  });
};

export const sendMagicLink = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'Test <onboarding@boboddy.business>',
    to,
    subject: 'Sign in to your account',
    html: await render(<MagicLinkEmail url={url} />),
  });
};

export const sendResetPassword = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'Test <onboarding@boboddy.business>',
    to,
    subject: 'Reset your password',
    html: await render(<ResetPasswordEmail url={url} />),
  });
};

// Internal actions for scheduling from Better Auth hooks
export const internal_sendEmailVerification = internalAction({
  args: {
    to: v.string(),
    url: v.string(),
  },
  handler: async (ctx, { to, url }) => {
    await sendEmailVerification(ctx, { to, url });
  },
});

export const internal_sendOTPVerification = internalAction({
  args: {
    to: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { to, code }) => {
    await sendOTPVerification(ctx, { to, code });
  },
});

export const internal_sendMagicLink = internalAction({
  args: {
    to: v.string(),
    url: v.string(),
  },
  handler: async (ctx, { to, url }) => {
    await sendMagicLink(ctx, { to, url });
  },
});

export const internal_sendResetPassword = internalAction({
  args: {
    to: v.string(),
    url: v.string(),
  },
  handler: async (ctx, { to, url }) => {
    await sendResetPassword(ctx, { to, url });
  },
});
