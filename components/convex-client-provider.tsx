'use client'

import type { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { authClient } from '@/lib/auth-client'
import { OrganizationProvider } from './organization/organization-context'
import { Toaster } from '@/components/ui/sonner'

// Defensive: fail gracefully if env var is missing instead of crashing module load
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL

function getConvexClient(): ConvexReactClient | null {
  if (!CONVEX_URL) {
    console.error(
      '[ConvexClientProvider] NEXT_PUBLIC_CONVEX_URL is not set. ' +
      'Check your .env.local file or Vercel environment variables.'
    )
    return null
  }
  return new ConvexReactClient(CONVEX_URL, { expectAuth: true })
}

const convex = getConvexClient()

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode
  initialToken?: string | null
}) {
  if (!convex) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-muted-foreground">
            Unable to connect to the backend. Please check that NEXT_PUBLIC_CONVEX_URL is configured.
          </p>
        </div>
      </div>
    )
  }

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
