'use client';

import { CheckoutLink } from '@convex-dev/polar/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { FunctionReturnType } from 'convex/server';

type Product = NonNullable<
  FunctionReturnType<typeof api.polar.getConfiguredProducts>
>[keyof FunctionReturnType<typeof api.polar.getConfiguredProducts>];

interface PricingCardProps {
  product: Product;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  isPremium?: boolean;
  buttonText?: string;
  variant?: 'default' | 'outline';
}

export function PricingCard({
  product,
  features,
  highlighted = false,
  badge,
  isPremium = false,
  buttonText,
  variant = 'default',
}: PricingCardProps) {
  const price = product.prices[0];
  const interval = price?.recurringInterval;
  const amount = (price?.priceAmount ?? 0) / 100;

  const defaultButtonText = isPremium
    ? `Switch to ${interval === 'month' ? 'Monthly' : 'Yearly'}`
    : 'Get Started';

  return (
    <Card
      className={`p-8 flex flex-col ${highlighted ? 'border-2 border-primary relative' : ''}`}
    >
      {badge && highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
          {badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
        <div className="text-4xl font-bold mb-4">
          ${amount}
          <span className="text-xl text-muted-foreground">/{interval}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <CheckoutLink
        polarApi={api.polar}
        productIds={[product.id]}
        className="w-full"
      >
        <Button className="w-full" variant={variant} size="lg">
          {buttonText || defaultButtonText}
        </Button>
      </CheckoutLink>
    </Card>
  );
}
