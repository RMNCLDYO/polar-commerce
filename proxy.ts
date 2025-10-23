import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const authFlowRoutes = [
  '/sign-in',
  '/sign-up',
  '/verify-2fa',
  '/reset-password',
];

const protectedRoutes = ['/dashboard', '/settings', '/portal'];

export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  const isAuthFlowRoute = authFlowRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isAuthFlowRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
