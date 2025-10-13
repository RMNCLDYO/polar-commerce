import '../utils/polyfills';
import { Resend } from '@convex-dev/resend';
import { render } from '@react-email/components';
// @ts-ignore - React is used implicitly in JSX
import * as React from 'react';
import { components } from '../_generated/api';
import type { ActionCtx } from '../_generated/server';
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
