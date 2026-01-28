# PROJECT KNOWLEDGE BASE

## OVERVIEW
App Router routes, layout, auth endpoints, and server actions for report generation.

## STRUCTURE
- layout.tsx: Root layout + ConvexClientProvider + globals.
- page.tsx: Client entry for dashboard (ProtectedRoute).
- auth/page.tsx: Client auth screen (login/register toggle).
- api/auth/[...all]/route.ts: Better Auth handlers.
- actions/report-actions.ts: Server actions for PDF/report storage.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Route entry | app/page.tsx | Client page wrapper |
| Auth screen | app/auth/page.tsx | Login/register UI |
| Providers | app/layout.tsx | ConvexClientProvider + Analytics |
| Auth API | app/api/auth/[...all]/route.ts | Better Auth route handler |
| Report generation | app/actions/report-actions.ts | "use server" actions |

## CONVENTIONS
- Interactive pages are marked "use client".
- Server Actions live under app/actions and are the only place to call server-only SDKs.
- ProtectedRoute wraps sensitive routes.

## ANTI-PATTERNS
- Do not call Convex server-only APIs from client components here.
- Do not call Appwrite admin APIs from client components here.
- Do not expose dashboard without ProtectedRoute.
- Avoid passing auth state through props; use authClient session hooks.

## NOTES
- Report actions use Vercel Blob + Convex metadata.
