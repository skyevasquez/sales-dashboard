'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/client';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function WorkOSSignInButton() {
  const { signIn } = useAuth();

  return (
    <Button onClick={() => signIn()} className="gap-2">
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}
