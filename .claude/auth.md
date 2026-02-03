# Auth (WorkOS AuthKit)

## Flow
1. User visits `/` → route guard checks session → redirects to `/auth` if not logged in
2. User logs in at `/auth` → AuthKit → Convex
3. On success, redirect to `/` → organization auto-created if none exists
4. Session managed via AuthKit cookies

## Authorization Rules
- All Convex queries/mutations require authentication
- Organization access enforced in Convex helpers
- Users can only access their organization's data

## Related Files
- `app/api/auth/[...all]/route.ts`
- `components/auth/`
- `lib/auth-client.ts`
- `lib/auth-server.ts`
- `convex/lib/auth.ts`
