'use client';

import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function WorkOSSignInButton() {
  return (
    <Button onClick={async () => {
      const signInUrl = await getSignInUrl();
      window.location.href = signInUrl;
    }} className="gap-2" size="lg">
      <LogIn className="h-5 w-5" />
      Sign In with WorkOS
    </Button>
  );
}
