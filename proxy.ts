import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
  'https://applogic.space';
const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
const redirectUri =
  process.env.WORKOS_REDIRECT_URI ||
  `${normalizedSiteUrl}/auth/callback`;

export default authkitMiddleware({ redirectUri });

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
