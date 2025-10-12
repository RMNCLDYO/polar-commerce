import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

// Auth flow routes (sign-in, sign-up, etc.)
const authFlowRoutes = [
  '/sign-in',
  '/sign-up',
  '/verify-2fa',
  '/reset-password',
];

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/portal'];

export default async function middleware(request: NextRequest) {
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

  // Redirect to dashboard if signed in and on auth flow pages
  if (isAuthFlowRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to sign-in if trying to access protected route without auth
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
