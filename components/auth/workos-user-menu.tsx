'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export function WorkOSUserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email || 'User';

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/account">
          <Settings className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => signOut()}>
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
