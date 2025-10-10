/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSessionCookie } from 'better-auth/cookies';
//import { createAuth } from "./convex/auth";
import { type NextRequest, NextResponse } from 'next/server';

//type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
/*
const getSession = async (request: NextRequest) => {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        origin: request.nextUrl.origin,
      },
    },
  );
  return session;
};
*/

// Auth flow routes (sign-in, sign-up, etc.)
const authFlowRoutes = [
  '/sign-in',
  '/sign-up',
  '/verify-2fa',
  '/reset-password',
];

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/portal'];

// Tier-specific routes
const starterRoutes: string[] = []; // Add starter-specific routes here
const premiumRoutes: string[] = []; // Add premium-specific routes here

// Just check cookie, recommended approach
export default async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // Check if it's an auth flow route
  const isAuthFlowRoute = authFlowRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check tier-specific routes
  const isStarterRoute = starterRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPremiumRoute = premiumRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect to dashboard if signed in and on auth flow pages
  if (isAuthFlowRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to sign-in if trying to access protected route without auth
  if (
    (isProtectedRoute || isStarterRoute || isPremiumRoute) &&
    !sessionCookie
  ) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Tier-based access control (can be enhanced when tier routes are added)
  // TODO: Uncomment and implement when you have tier-specific routes
  /*
  if (sessionCookie && (isStarterRoute || isPremiumRoute)) {
    // Would need to fetch session to check tier
    const session = await getSession(request);
    const userTier = session?.tier || 'free';

    if (isStarterRoute && userTier === 'free') {
      return NextResponse.redirect(new URL('/pricing?upgrade=starter', request.url));
    }

    if (isPremiumRoute && userTier !== 'premium') {
      return NextResponse.redirect(new URL('/pricing?upgrade=premium', request.url));
    }
  }
  */

  return NextResponse.next();
}

export const config = {
  // Run proxy on all routes except static assets and api routes
  matcher: ['/((?!.*\\..*|_next|api/auth).*)', '/', '/trpc(.*)'],
};
