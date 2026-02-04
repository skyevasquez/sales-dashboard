import { handleAuth } from '@workos-inc/authkit-nextjs';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { ensureRuntimeEnv } from '@/lib/runtime-env';

ensureRuntimeEnv([
  'WORKOS_API_KEY',
  'WORKOS_CLIENT_ID',
  'WORKOS_COOKIE_PASSWORD',
  'WORKOS_REDIRECT_URI',
  'NEXT_PUBLIC_CONVEX_URL',
]);

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    console.error('NEXT_PUBLIC_CONVEX_URL is not set');
    return null;
  }
  return new ConvexHttpClient(url);
}

function getBaseURL() {
  const redirectUri = process.env.WORKOS_REDIRECT_URI;
  if (redirectUri) {
    return redirectUri.replace('/auth/callback', '');
  }
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
    'https://applogic.space';
  return siteUrl.replace(/\/$/, '');
}

export const GET = handleAuth({
  returnPathname: '/',
  baseURL: getBaseURL(),
  onSuccess: async ({ user }) => {
    const convex = getConvexClient();
    if (!convex) {
      console.error('Skipping Convex sync - client not available');
      return;
    }

    try {
      await convex.mutation(api.users.upsertUser, {
        workosUserId: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      });

      const adminResult = await convex.mutation(api.users.bootstrapAdminOnLogin, {
        workosUserId: user.id,
        email: user.email,
      });

      if (adminResult.isAdmin) {
        console.log(`Admin access granted to ${user.email}`);
      }
    } catch (error) {
      console.error('Failed to sync user to Convex:', error);
    }
  },
});
