import { v } from 'convex/values';
import { httpAction, internalAction } from '../_generated/server';

/**
 * HTTP actions to trigger Next.js cache revalidation.
 * These can be called from Convex mutations/actions after data changes.
 */

/**
 * Internal action to trigger cache revalidation.
 * Called from other Convex functions after data changes.
 */
export const triggerRevalidation = internalAction({
  args: {
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REVALIDATE_SECRET}`,
        },
        body: JSON.stringify({
          tags: args.tags,
        }),
      });

      if (!response.ok) {
        console.error('Failed to revalidate cache:', await response.text());
      }

      return { success: true };
    } catch (error) {
      console.error('Error revalidating cache:', error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Revalidate product caches after product updates.
 * Call this after: product create, update, delete, inventory change.
 */
export const revalidateProducts = httpAction(async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVALIDATE_SECRET}`,
      },
      body: JSON.stringify({
        tags: ['products', 'catalog'],
      }),
    });

    if (!response.ok) {
      console.error('Failed to revalidate cache:', await response.text());
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error revalidating cache:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Revalidate a specific product cache.
 */
export const revalidateProduct = httpAction(async (ctx, request) => {
  const { productId } = await request.json();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVALIDATE_SECRET}`,
      },
      body: JSON.stringify({
        tags: [`product-${productId}`],
      }),
    });

    if (!response.ok) {
      console.error('Failed to revalidate product cache:', await response.text());
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error revalidating product cache:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
