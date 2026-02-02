import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

const redirectUri = process.env.WORKOS_REDIRECT_URI || 'https://brown-eel-742901.hostingersite.com/auth/callback';

export default authkitMiddleware({
  redirectUri,
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
