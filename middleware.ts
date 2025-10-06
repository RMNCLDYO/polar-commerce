/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSessionCookie } from 'better-auth/cookies';
//import { createAuth } from "./convex/auth";
import { NextRequest, NextResponse } from 'next/server';

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

const signInRoutes = ['/sign-in', '/sign-up', '/verify-2fa'];
const protectedRoutes = ['/dashboard', '/settings'];

// Just check cookie, recommended approach
export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // Uncomment to fetch the session (not recommended)
  // const session = await getSession(request);

  const isSignInRoute = signInRoutes.includes(request.nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // Redirect to dashboard if signed in and on auth pages
  if (isSignInRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to sign-in if trying to access protected route without auth
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and api routes
  matcher: ['/((?!.*\\..*|_next|api/auth).*)', '/', '/trpc(.*)'],
};
