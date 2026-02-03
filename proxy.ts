import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
  'https://applogic.space';
const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
const redirectUri =
  process.env.WORKOS_REDIRECT_URI ||
  `${normalizedSiteUrl}/auth/callback`;

const hasAuthEnv =
  !!process.env.WORKOS_API_KEY &&
  !!process.env.WORKOS_CLIENT_ID &&
  !!process.env.WORKOS_COOKIE_PASSWORD &&
  !!process.env.WORKOS_REDIRECT_URI;

const handler = authkitMiddleware({ redirectUri });

export default async function proxy(request: NextRequest) {
  if (!hasAuthEnv) {
    return NextResponse.next();
  }
  // Let the auth routes render their own diagnostics.
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }
  try {
    return await handler(request);
  } catch (error) {
    console.error('AuthKit middleware failed:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
