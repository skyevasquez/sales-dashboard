import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const env = process.env as Record<string, string | undefined>;
const siteUrl =
  env["SITE_URL"] ||
  env["NEXT_PUBLIC_CONVEX_SITE_URL"] ||
  'https://applogic.space';
const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
const redirectUri =
  env["WORKOS_REDIRECT_URI"] ||
  env["NEXT_PUBLIC_WORKOS_REDIRECT_URI"] ||
  `${normalizedSiteUrl}/auth/callback`;

const hasAuthEnv =
  !!env["WORKOS_API_KEY"] &&
  !!env["WORKOS_CLIENT_ID"] &&
  !!env["WORKOS_COOKIE_PASSWORD"] &&
  (!!env["WORKOS_REDIRECT_URI"] || !!env["NEXT_PUBLIC_WORKOS_REDIRECT_URI"]);

const handler = authkitMiddleware({ redirectUri });

export default async function proxy(request: NextRequest) {
  if (!hasAuthEnv) {
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
