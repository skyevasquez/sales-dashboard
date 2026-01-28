# PROJECT KNOWLEDGE BASE

## OVERVIEW
Pure utilities for CSV handling, historical analytics, and dashboard preferences.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| CSV import | utils/csv-import.ts | Parsing + validation |
| CSV export | utils/csv-export.ts | Serialization + download |
| Trends data | utils/historical-data.ts | Local history + metrics |
| UI prefs | utils/dashboard-preferences.ts | localStorage-backed |

## CONVENTIONS
- Keep utilities data-only and serializable.
- LocalStorage access should be guarded for SSR contexts.
- CSV headers are strict; keep import/export in sync.

## ANTI-PATTERNS
- No React imports or hooks here.
- Avoid large payloads in localStorage.
- Do not mutate shared data in-place; clone when needed.

## NOTES
- Historical data is capped (90-day rolling window).
