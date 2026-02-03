# Stack & Structure

## Technology Stack
- **Framework:** Next.js (App Router, keep on latest for security)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Charts:** Recharts
- **Backend:** Convex
- **Auth:** WorkOS AuthKit
- **PDF Generation:** jspdf
- **File Storage:** Vercel Blob
- **Analytics:** Vercel Analytics
- **Fonts:** Geist
- **Forms:** React Hook Form + Zod
- **Toast Notifications:** Sonner

## Project Structure (Key Paths)
- `app/` - App Router pages, layouts, server actions
- `components/` - UI and feature components
- `components/ui/` - shadcn/ui primitives
- `convex/` - Convex schema, queries, mutations, auth helpers
- `lib/` - Client/server utilities
- `utils/` - CSV + data helpers

## Build Configuration Notes
- `next.config.mjs` ignores TypeScript errors on build
- Next.js image optimization is disabled (`unoptimized: true`)
