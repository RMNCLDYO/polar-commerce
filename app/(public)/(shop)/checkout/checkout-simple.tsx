'use client';

/**
 * Simple Checkout Page using @convex-dev/polar React Components
 *
 * This is the PREFERRED approach for simple subscription checkouts.
 * Uses the component's <CheckoutLink> which handles everything automatically.
 *
 * For advanced features (discounts, business customers, custom fields),
 * use the advanced checkout page instead.
 */

import { CheckoutLink } from '@convex-dev/polar/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/card';
import { useQuery } from 'convex/react';

export function SimpleCheckout() {
  // Get products using the component's built-in query
  const products = useQuery(api.polar.listAllProducts);

  if (!products) {
    return <div>Loading products...</div>;
  }

  // Filter for subscription products
  const monthlyProducts = products.filter(
    (p) => p.prices[0]?.recurringInterval === 'month',
  );
  const yearlyProducts = products.filter(
    (p) => p.prices[0]?.recurringInterval === 'year',
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Plan */}
      {monthlyProducts.map((product) => (
        <Card key={product.id} className="p-6">
          <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
          <p className="text-muted-foreground mb-4">{product.description}</p>

          <div className="text-3xl font-bold mb-6">
            ${(product.prices[0]?.priceAmount ?? 0) / 100}
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </div>

          {/* Using Polar Component's CheckoutLink */}
          <CheckoutLink
            polarApi={api.polar}
            productIds={[product.id]}
            embed={true}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Subscribe Monthly
          </CheckoutLink>
        </Card>
      ))}

      {/* Yearly Plan */}
      {yearlyProducts.map((product) => (
        <Card key={product.id} className="p-6 border-primary">
          <div className="text-xs font-semibold text-primary mb-2">
            BEST VALUE
          </div>
          <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
          <p className="text-muted-foreground mb-4">{product.description}</p>

          <div className="text-3xl font-bold mb-6">
            ${(product.prices[0]?.priceAmount ?? 0) / 100}
            <span className="text-sm font-normal text-muted-foreground">
              /year
            </span>
          </div>

          {/* Using Polar Component's CheckoutLink */}
          <CheckoutLink
            polarApi={api.polar}
            productIds={[product.id]}
            embed={true}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Subscribe Yearly
          </CheckoutLink>
        </Card>
      ))}
    </div>
  );
}
