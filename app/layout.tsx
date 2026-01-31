import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { OrganizationProvider } from '@/components/organization/organization-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sales Dashboard',
  description: 'Track and manage your sales goals and KPIs',
  generator: 'v0.app',
  other: {
    'theme-color': '#000000',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <style>{`
 html {
   font-family: ${GeistSans.style.fontFamily};
   --font-sans: ${GeistSans.variable};
   --font-mono: ${GeistMono.variable};
 }
        `}</style>
      </head>
      <body>
        <AuthKitProvider>
          <ConvexClientProvider>
            <OrganizationProvider>
              {children}
            </OrganizationProvider>
          </ConvexClientProvider>
        </AuthKitProvider>
        <Analytics />
      </body>
    </html>
  )
}
