'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/client/auth';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [signInMethod, setSignInMethod] = useState<'password' | 'passwordless'>(
    'passwordless',
  );

  const handleSignIn = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setOtpLoading(true);
        },
        onSuccess: (ctx) => {
          setOtpLoading(false);
          if (ctx.data.twoFactorRedirect) {
            router.push('/verify-2fa');
          } else {
            router.push('/');
          }
        },
        onError: (ctx) => {
          setOtpLoading(false);
          alert(ctx.error.message);
        },
      },
    );
  };

  const handleResetPassword = async () => {
    setForgotLoading(true);
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      alert('Check your email for the reset password link!');
    } catch {
      alert('Failed to send reset password link. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    await authClient.signIn.magicLink(
      {
        email,
      },
      {
        onRequest: () => {
          setMagicLinkLoading(true);
        },
        onSuccess: () => {
          setMagicLinkLoading(false);
          alert('Check your email for the magic link!');
        },
        onError: (ctx) => {
          setMagicLinkLoading(false);
          alert(ctx.error.message);
        },
      },
    );
  };

  const handleGithubSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: 'github',
      },
      {
        onRequest: () => {
          setOtpLoading(true);
        },
        onResponse: () => setOtpLoading(false),
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      },
    );
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (signInMethod === 'password') {
              handleSignIn();
            }
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
            />
          </div>

          {signInMethod === 'password' && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  onClick={handleResetPassword}
                  className="cursor-pointer"
                  disabled={forgotLoading || !email}
                >
                  {forgotLoading ? (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  ) : null}
                  Forgot your password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="password"
                autoComplete="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {signInMethod === 'password' && (
              <Button type="submit" className="w-full" disabled={otpLoading}>
                Sign in with Password
              </Button>
            )}
            {signInMethod === 'passwordless' && (
              <Button
                type="button"
                className="w-full"
                disabled={magicLinkLoading}
                onClick={handleMagicLinkSignIn}
              >
                {magicLinkLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Send Magic Link'
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              className="text-sm"
              onClick={() => {
                setSignInMethod(
                  signInMethod === 'password' ? 'passwordless' : 'password',
                );
                setPassword('');
              }}
            >
              {signInMethod === 'passwordless'
                ? 'Sign in with password instead'
                : 'Sign in with magic link instead'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={otpLoading}
            onClick={handleGithubSignIn}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              />
            </svg>
            Sign in with Github
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
