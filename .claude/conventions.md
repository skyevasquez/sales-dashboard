# Conventions

## Component Structure
- Add `"use client"` when using React hooks, browser APIs, Convex hooks, or auth client hooks
- Default to Server Components in App Router pages

## File Organization
- Domain types live in `components/sales-dashboard.tsx`
- Server actions in `app/actions/` with `"use server"`
- Convex functions are organized by domain (e.g., `stores.ts`, `kpis.ts`)
- UI primitives live in `components/ui/` (shadcn pattern)

## Naming
- Components: PascalCase
- Hooks: `use` prefix in camelCase
- Convex functions: camelCase
- Types/Interfaces: PascalCase

## Imports
```typescript
// Third-party
import { useQuery, useMutation } from "convex/react"

// Absolute project imports
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"

// Relative for co-located
import { AddStoreDialog } from "./add-store-dialog"
```

## Tailwind + shadcn/ui
- Use `cn()` from `@/lib/utils` for conditional classes
- CSS variables defined in `app/globals.css`
- Dark mode via `next-themes` with `dark` class strategy

## Security
- Keep secrets in `.env.local` (gitignored)
- Don’t expose server keys to the client
- Enforce org access in Convex helpers
- Validate inputs with Zod or Convex validators
- Don’t throw on missing env vars at import time

## Legacy Appwrite
Appwrite files are retained for reference but not used at runtime:
- `context/AuthContext.tsx`
- `lib/appwrite.ts`
- `lib/appwrite-client.ts`
- `appwrite.json`
- `setup-appwrite.sh`
- `QUICKSTART.md`
- `APPWRITE_SETUP.md`
