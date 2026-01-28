# PROJECT KNOWLEDGE BASE

**Project:** Sales Dashboard  
**Type:** Next.js 15 App Router + Convex + Better Auth  
**Last Updated:** 2026-01-28

---

## OVERVIEW

A modern sales tracking and analytics dashboard for multi-store KPI management. Users can define stores and custom KPIs, track month-to-date (MTD) sales against goals, visualize performance with interactive charts, generate PDF reports, and import/export CSV data.

**Core Workflows:**
1. User authenticates via Better Auth → auto-creates organization on first login
2. User adds stores and KPIs → system creates default sales data entries
3. User enters daily MTD sales and monthly goals → stored in `daily_sales` table
4. Dashboard displays real-time calculations: % to goal, projections, trends
5. User generates PDF reports → uploaded to Vercel Blob → metadata stored in Convex

---

## TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16.1.4 (App Router) | React framework with server components |
| **Language** | TypeScript 5 | Type safety |
| **Styling** | Tailwind CSS 3.4.17 | Utility-first CSS |
| **UI Components** | shadcn/ui + Radix UI | Accessible component primitives |
| **Charts** | Recharts | Data visualization |
| **Backend** | Convex | Serverless database + functions |
| **Auth** | Better Auth + @convex-dev/better-auth | Email/password authentication |
| **PDF Generation** | jspdf | Client-side PDF creation |
| **File Storage** | Vercel Blob | Report PDF storage |
| **Analytics** | Vercel Analytics | Web analytics |
| **Fonts** | Geist | Sans and mono font family |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **Toast Notifications** | Sonner | User feedback |

---

## PROJECT STRUCTURE

```
sales-dashboard/
├── app/                          # Next.js App Router
│   ├── actions/
│   │   └── report-actions.ts     # Server actions: PDF generation, Blob storage
│   ├── api/auth/[...all]/
│   │   └── route.ts              # Better Auth API route handler
│   ├── auth/
│   │   └── page.tsx              # Login/register page (public)
│   ├── globals.css               # Tailwind + CSS variables
│   ├── layout.tsx                # Root layout + providers
│   └── page.tsx                  # Dashboard (protected)
│
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Email/password sign in
│   │   ├── register-form.tsx     # Account creation
│   │   ├── protected-route.tsx   # Route guard (client-side)
│   │   └── user-menu.tsx         # Avatar + logout dropdown
│   ├── ui/                       # shadcn/ui components (50+ primitives)
│   ├── sales-dashboard.tsx       # Main dashboard container
│   ├── sales-visualizations.tsx  # Charts and graphs
│   ├── customizable-dashboard.tsx # Draggable dashboard layout
│   ├── trend-analysis.tsx        # Trend forecasting UI
│   ├── add-store-dialog.tsx      # Create store modal
│   ├── add-kpi-dialog.tsx        # Create KPI modal
│   ├── generate-report-dialog.tsx # Report generation UI
│   ├── reports-list.tsx          # Saved reports display
│   ├── export-csv-dialog.tsx     # CSV export UI
│   ├── import-csv-dialog.tsx     # CSV import UI
│   ├── convex-client-provider.tsx # Convex + auth provider
│   └── theme-provider.tsx        # Dark mode provider
│
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated types and API
│   ├── lib/
│   │   └── auth.ts               # Auth helpers: getViewer, assertOrgAccess
│   ├── schema.ts                 # Database schema definition
│   ├── auth.ts                   # Better Auth configuration
│   ├── auth.config.ts            # Auth provider config
│   ├── organizations.ts          # Org CRUD + membership
│   ├── stores.ts                 # Store CRUD
│   ├── kpis.ts                   # KPI CRUD
│   ├── dailySales.ts             # Sales data queries/mutations
│   ├── monthlyRollups.ts         # Monthly aggregation
│   ├── reports.ts                # Report metadata CRUD
│   ├── appRoles.ts               # Role-based access (super_admin)
│   ├── crons.ts                  # Scheduled jobs
│   └── http.ts                   # HTTP actions
│
├── lib/                          # Client libraries
│   ├── auth-client.ts            # Better Auth React client
│   ├── auth-server.ts            # Better Auth server helpers
│   ├── appwrite.ts               # Legacy Appwrite server client
│   ├── appwrite-client.ts        # Legacy Appwrite client
│   ├── db-service.ts             # Legacy database service
│   └── utils.ts                  # cn() helper for Tailwind
│
├── utils/                        # Utility functions
│   ├── csv-import.ts             # CSV parsing logic
│   ├── csv-export.ts             # CSV generation
│   ├── dashboard-preferences.ts  # LocalStorage preferences
│   └── historical-data.ts        # Historical data helpers
│
├── hooks/                        # React hooks
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.tsx            # Mobile breakpoint detection
│
├── context/                      # Legacy React contexts
│   └── AuthContext.tsx           # Legacy Appwrite auth context
│
├── public/                       # Static assets
├── styles/                       # Additional styles
├── appwrite.json                 # Legacy Appwrite schema
├── setup-appwrite.sh             # Legacy setup script
└── .env.local                    # Environment variables
```

---

## DATABASE SCHEMA (Convex)

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organizations` | Multi-tenancy | name, slug, ownerId |
| `members` | Org membership | orgId, userId, role (owner/admin/member) |
| `appRoles` | Global roles | userId, role (user/super_admin) |
| `stores` | Store locations | orgId, name |
| `kpis` | Custom KPIs | orgId, name |
| `daily_sales` | Daily sales records | orgId, storeId, kpiId, dateKey, monthKey, dailyValue, monthlyGoal |
| `monthly_rollups` | Aggregated monthly data | orgId, storeId, kpiId, monthKey, totalSales |
| `reports` | Generated report metadata | orgId, name, url (Blob), storeIds[] |

### Key Indexes

- `daily_sales.by_org_month` - Query sales by organization and month
- `daily_sales.by_org_store_kpi_month` - Upsert sales records
- `members.by_org_user` - Check organization access
- `organizations.by_slug` - Lookup by slug

---

## BUILD & DEVELOPMENT

### Prerequisites

- Node.js 18+
- npm (package-lock.json present)
- Convex account (free tier)

### Environment Variables

Create `.env.local`:

```env
# Convex (required)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=http://localhost:3000
CONVEX_DEPLOYMENT=dev:your-deployment

# Optional overrides
SITE_URL=http://localhost:3000

# Vercel Blob (optional, for PDF storage)
BLOB_READ_WRITE_TOKEN=your_token
```

### Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start Convex dev server (provisions backend)
npx convex dev

# Start Next.js dev server
npm run dev              # Runs on http://localhost:3000

# Build for production
npm run build           # Ignores TypeScript errors per next.config.mjs

# Start production server
npm start

# Lint
npm run lint
```

### Build Configuration

`next.config.mjs`:
- TypeScript errors ignored during build (`ignoreBuildErrors: true`)
- Images unoptimized (`unoptimized: true`)

---

## CODING CONVENTIONS

### Component Structure

1. **Client Components:** Use `"use client"` directive when using:
   - React hooks (useState, useEffect, useMemo)
   - Browser APIs
   - Convex hooks (useQuery, useMutation)
   - Auth client hooks

2. **Server Components:** Default for all app router pages
   - Use async/await for data fetching
   - Import server-only libraries

### File Organization

- **Domain types** defined in `components/sales-dashboard.tsx` (Store, Kpi, SalesData)
- **Server actions** in `app/actions/` with `"use server"`
- **Convex functions** co-located by domain (stores.ts, kpis.ts, etc.)
- **UI primitives** in `components/ui/` (shadcn pattern)

### Naming Conventions

- Components: PascalCase (e.g., `SalesDashboard`)
- Hooks: camelCase with `use` prefix (e.g., `useSession`)
- Convex functions: camelCase (e.g., `listStores`, `createStore`)
- Types/Interfaces: PascalCase (e.g., `SalesData`, `CsvImportResult`)

### Import Pattern

```typescript
// Third-party
import { useQuery, useMutation } from "convex/react"
import { authClient } from "@/lib/auth-client"

// Absolute project imports
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"

// Relative for co-located
import { AddStoreDialog } from "./add-store-dialog"
```

### Tailwind + shadcn/ui

- Use `cn()` utility from `@/lib/utils` for conditional classes
- CSS variables defined in `app/globals.css` for theming
- Dark mode via `next-themes` with `dark` class strategy

---

## AUTHENTICATION ARCHITECTURE

### Flow

1. User visits `/` → `ProtectedRoute` checks session → redirects to `/auth` if not logged in
2. User logs in at `/auth` → `authClient.signIn.email()` → Better Auth → Convex
3. On success, redirect to `/` → organization auto-created if none exists
4. Session managed via Better Auth cookies

### Key Components

| File | Purpose |
|------|---------|
| `lib/auth-client.ts` | React client: `authClient.useSession()`, `signIn.email()`, `signOut()` |
| `lib/auth-server.ts` | Server helpers: `handler`, `fetchAuthQuery`, `isAuthenticated` |
| `convex/auth.ts` | Better Auth configuration with Convex adapter |
| `convex/lib/auth.ts` | Authorization helpers: `getViewer`, `assertOrgAccess`, `isSuperAdmin` |
| `components/auth/protected-route.tsx` | Client-side route guard |

### Authorization Rules

- All Convex queries/mutations require authentication via `getViewer()`
- Organization access checked via `assertOrgAccess()`
- Super admins bypass organization checks
- Users can only access their organization's data

---

## DATA FLOW

### Sales Data Entry

```
User Input (MTD Sales)
    ↓
sales-dashboard.tsx: updateSalesData()
    ↓
Convex mutation: dailySales.upsertFromMtd()
    ↓
Calculate daily delta → Store in daily_sales table
    ↓
Query daily_sales.getSalesSummary() aggregates by store+KPI
```

### Report Generation

```
User clicks "Generate Report"
    ↓
Server action: report-actions.ts:generateReport()
    ↓
jsPDF creates PDF in memory
    ↓
Vercel Blob: put() uploads PDF
    ↓
Convex mutation: reports.createReport() stores metadata
    ↓
Return report URL to UI
```

### CSV Import

```
User uploads CSV
    ↓
utils/csv-import.ts:parseSalesCsv()
    ↓
Detect new stores/KPIs → Create them
    ↓
Resolve names to IDs
    ↓
Upsert sales data via dailySales.upsertFromMtd()
```

---

## TESTING

No formal test suite is currently configured. The project relies on:

- TypeScript for compile-time checking
- Manual testing via `npm run dev`
- Convex type safety via generated types

---

## SECURITY CONSIDERATIONS

### DO

- ✅ Keep `APPWRITE_API_KEY` server-side only (legacy)
- ✅ Use `fetchAuthQuery`/`fetchAuthMutation` for authenticated server actions
- ✅ Check `assertOrgAccess` in all Convex functions
- ✅ Validate all inputs with Zod or Convex validators
- ✅ Store secrets in `.env.local` (gitignored)

### DON'T

- ❌ Never commit `.env.local`
- ❌ Don't expose Convex admin keys to client
- ❌ Don't bypass `ProtectedRoute` for dashboard routes
- ❌ Don't throw on missing env vars at import time (graceful degradation)

### Current Config

- Password minimum: 8 characters (Better Auth default)
- Email verification: Disabled (`requireEmailVerification: false`)
- Session: Cookie-based with Better Auth

---

## LEGACY APPWRITE SETUP

The project retains Appwrite setup scripts and documentation for historical purposes:

- `context/AuthContext.tsx` - Legacy React context for Appwrite auth
- `lib/appwrite.ts` - Server-side Appwrite client
- `lib/appwrite-client.ts` - Client-side Appwrite client
- `appwrite.json` - Appwrite schema definition
- `setup-appwrite.sh` - Automated setup script
- `QUICKSTART.md` - Appwrite CLI setup guide
- `APPWRITE_SETUP.md` - Detailed Appwrite configuration

**Note:** The runtime backend uses Convex + Better Auth. Appwrite files are not actively used but retained for reference.

---

## COMMON TASKS

### Add a New Convex Query

1. Define in `convex/{domain}.ts`:
```typescript
export const myQuery = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) throw new Error("Unauthorized");
    await assertOrgAccess(ctx, args.orgId, viewer);
    // ... implementation
  },
});
```

2. Use in component:
```typescript
const data = useQuery(api.{domain}.myQuery, orgId ? { orgId } : "skip");
```

### Add a New shadcn/ui Component

```bash
npx shadcn add component-name
```

### Add a New KPI Type

1. Add to `convex/schema.ts` `kpis` table if storing metadata
2. Update CSV import/export in `utils/` if needed
3. Update UI components displaying KPI data

---

## DEPENDENCY NOTES

- Both `package-lock.json` and `pnpm-lock.yaml` exist; npm is the primary package manager
- React 19 is used (latest with Next.js 16)
- `@convex-dev/better-auth` provides Convex integration for Better Auth
- `convex` package provides type generation via `npx convex dev`

---

## TROUBLESHOOTING

### "Unauthorized" errors
- Check that `npx convex dev` is running
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Clear cookies and re-authenticate

### Type errors after schema change
- Run `npx convex dev` to regenerate types
- Restart TypeScript server in IDE

### Build failures
- Build ignores TypeScript errors by design
- Check for runtime errors in browser console

---

## REFERENCES

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev/)
- [Better Auth Docs](https://www.better-auth.com/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
