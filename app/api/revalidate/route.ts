import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for on-demand cache revalidation.
 * Called by Convex after data changes to invalidate caches.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tags to revalidate
    const body = await request.json();
    const { tags } = body as { tags?: string[] };

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Invalid request: tags array required' },
        { status: 400 }
      );
    }

    // Revalidate each tag
    for (const tag of tags) {
      revalidateTag(tag, 'max');
    }

    return NextResponse.json({
      success: true,
      revalidated: tags,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
