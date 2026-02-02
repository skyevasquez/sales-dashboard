import { handleAuth } from '@workos-inc/authkit-nextjs';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    console.error('NEXT_PUBLIC_CONVEX_URL is not set');
    return null;
  }
  return new ConvexHttpClient(url);
}

export const GET = handleAuth({
  returnPathname: '/',
  onSuccess: async ({ user }) => {
    // Don't block auth flow if Convex sync fails
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
      // Log but don't throw - allow auth to complete even if Convex fails
      console.error('Failed to sync user to Convex:', error);
    }
  },
});
