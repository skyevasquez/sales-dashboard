'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/client';
import { Loader2 } from 'lucide-react';

interface WorkOSProtectedRouteProps {
  children: React.ReactNode;
}

export function WorkOSProtectedRoute({ children }: WorkOSProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
