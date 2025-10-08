'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useState } from 'react';
import { authClient } from '@/lib/client/auth';
import EnableTwoFactor from './EnableTwoFactor';
import { ArrowLeft, AlertTriangle, Crown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CustomerPortalLink } from '@convex-dev/polar/react';

export default function SettingsPage() {
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);

  const handleDisable2FA = async () => {
    try {
      throw new Error('Not implemented');
      setLoading(true);
      await authClient.twoFactor.disable({
        password: '',
      });
    } catch {
      alert('Failed to disable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.',
      )
    ) {
      try {
        await authClient.deleteUser();
        router.push('/');
      } catch {
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {showEnable2FA ? (
          <EnableTwoFactor />
        ) : (
          <div className="w-full space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              asChild
            >
              <Link href="/dashboard">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
            </Button>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Settings</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Manage your account settings and security
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account by
                      requiring a verification code in addition to your
                      password.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowEnable2FA(true)}
                      disabled={loading}
                    >
                      Enable 2FA
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisable2FA}
                      disabled={loading}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-6">
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Crown className="text-yellow-500" size={16} />
                      Subscription Management
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user?.tier && user.tier !== 'free'
                        ? `You're currently on the ${user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} plan (${user.subscription?.productKey || 'N/A'})`
                        : 'Upgrade to Starter or Premium for exclusive benefits'}
                    </p>
                    {user?.subscription && (
                      <div className="mb-4 p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium capitalize">
                            {user.subscription.status}
                          </span>
                        </div>
                        {user.subscription.currentPeriodEnd && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Renews on:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                user.subscription.currentPeriodEnd,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {user?.subscription ? (
                      <CustomerPortalLink
                        polarApi={{
                          generateCustomerPortalUrl:
                            api.polar.generateCustomerPortalUrl,
                        }}
                      >
                        <Button>Manage Subscription</Button>
                      </CustomerPortalLink>
                    ) : (
                      <Button asChild>
                        <Link href="/pricing">View Plans</Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-6">
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                      Delete Account
                      <AlertTriangle size={14} className="text-destructive" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
