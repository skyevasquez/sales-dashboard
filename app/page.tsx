'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { SalesDashboard } from '@/components/sales-dashboard';
import { WorkOSProtectedRoute } from '@/components/auth/workos-protected-route';
import { WorkOSUserMenu } from '@/components/auth/workos-user-menu';
import { WorkOSSignInButton } from '@/components/auth/workos-sign-in-button';
import { OrgSelector } from '@/components/organization/org-selector';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
          <h1 className="text-3xl font-bold text-center">Sales Performance Dashboard</h1>
          <p className="text-muted-foreground text-center">
            Please sign in to access the dashboard
          </p>
          <WorkOSSignInButton />
        </div>
      </main>
    );
  }

  return (
    <WorkOSProtectedRoute>
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <OrgSelector />
          <h1 className="text-3xl font-bold text-center flex-1">Sales Performance Dashboard</h1>
          <WorkOSUserMenu />
        </div>
        <SalesDashboard />
      </main>
    </WorkOSProtectedRoute>
  );
}
