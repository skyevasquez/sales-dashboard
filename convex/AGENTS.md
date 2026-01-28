# PROJECT KNOWLEDGE BASE

## OVERVIEW
Convex backend: schema, auth integration, queries/mutations, and scheduled jobs.

## STRUCTURE
- schema.ts: Data model + indexes.
- auth.ts: Better Auth integration on Convex.
- auth.config.ts: Auth provider config.
- dailySales.ts: Sales aggregation + upsert logic.
- stores.ts, kpis.ts, reports.ts, organizations.ts: CRUD by domain.
- crons.ts: Scheduled rollups.
- http.ts: External HTTP routes.
- _generated/: Convex auto-generated types and API.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Schema | convex/schema.ts | Tables + indexes |
| Auth integration | convex/auth.ts | Better Auth + Convex adapter |
| Sales rollups | convex/dailySales.ts | Summaries + updates |
| Reports | convex/reports.ts | Report metadata |
| Scheduled jobs | convex/crons.ts | Monthly rollups |

## CONVENTIONS
- Use validators (v.*) for args in queries/mutations.
- Keep orgId scoping in all data access.
- Use _generated/api for type-safe client calls.

## ANTI-PATTERNS
- Do not edit files under convex/_generated.
- Do not import browser-only APIs in Convex functions.
- Avoid unscoped reads/writes; always filter by orgId.

## NOTES
- Convex is the primary runtime backend; Appwrite scripts are legacy.
