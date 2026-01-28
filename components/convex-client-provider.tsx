'use client'

import type { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { authClient } from '@/lib/auth-client'
import { OrganizationProvider } from './organization/organization-context'
import { Toaster } from '@/components/ui/sonner'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode
  initialToken?: string | null
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      <OrganizationProvider>
        {children}
        <Toaster />
      </OrganizationProvider>
    </ConvexBetterAuthProvider>
  )
}
