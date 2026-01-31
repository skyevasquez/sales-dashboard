import { handleAuth } from '@workos-inc/authkit-nextjs';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const GET = handleAuth({
  returnPathname: '/',
  onSuccess: async ({ user }) => {
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
