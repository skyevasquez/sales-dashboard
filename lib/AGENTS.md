# PROJECT KNOWLEDGE BASE

## OVERVIEW
Auth clients (Better Auth + Convex) plus legacy Appwrite client/server utilities.

## STRUCTURE
- auth-client.ts: Better Auth React client with Convex plugin.
- auth-server.ts: Better Auth server helpers for Next.js.
- appwrite.ts: Server-side Appwrite client setup (legacy).
- appwrite-client.ts: Browser-safe Appwrite client (legacy).
- db-service.ts: CRUD wrappers for Appwrite (legacy).
- utils.ts: cn() utility for class merging.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Auth client | lib/auth-client.ts | Better Auth + Convex plugin |
| Auth server | lib/auth-server.ts | Server-side auth helpers |
| Server Appwrite | lib/appwrite.ts | Uses APPWRITE_API_KEY |
| Client Appwrite | lib/appwrite-client.ts | Uses NEXT_PUBLIC_* |
| Database CRUD | lib/db-service.ts | Legacy Appwrite wrappers |
| Class merge | lib/utils.ts | cn() |

## CONVENTIONS
- Better Auth helpers live in auth-client.ts/auth-server.ts.
- Server vs client Appwrite SDKs are split by file.
- appwrite.ts logs missing env vars instead of throwing.

## ANTI-PATTERNS
- Never use APPWRITE_API_KEY in client bundles.
- Avoid direct databases.* calls inside components.

## NOTES
- db-service.ts is a client module ("use client").
- Appwrite utilities are legacy and may be unused by Convex-backed flows.
