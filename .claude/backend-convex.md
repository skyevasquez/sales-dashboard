# Backend (Convex)

## Schema (Core Tables)
- `organizations` - multi-tenancy
- `members` - org membership
- `appRoles` - global roles
- `stores` - store locations
- `kpis` - custom KPIs
- `daily_sales` - daily sales records
- `monthly_rollups` - aggregated monthly data
- `reports` - report metadata

## Key Indexes
- `daily_sales.by_org_month`
- `daily_sales.by_org_store_kpi_month`
- `members.by_org_user`
- `organizations.by_slug`

## Data Flow
### Sales Data Entry
User input (MTD sales) → `sales-dashboard.tsx:updateSalesData()` → `dailySales.upsertFromMtd()` → daily delta stored in `daily_sales` → `daily_sales.getSalesSummary()` aggregates by store + KPI.

### Report Generation
Generate report → `app/actions/report-actions.ts:generateReport()` → jsPDF → Vercel Blob `put()` → `reports.createReport()` stores metadata → UI receives report URL.

### CSV Import
Upload CSV → `utils/csv-import.ts:parseSalesCsv()` → create new stores/KPIs → resolve IDs → `dailySales.upsertFromMtd()`.

## Common Task: Add a Convex Query
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

```typescript
const data = useQuery(api.{domain}.myQuery, orgId ? { orgId } : "skip");
```
