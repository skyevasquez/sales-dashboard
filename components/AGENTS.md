# PROJECT KNOWLEDGE BASE

## OVERVIEW
Feature components and dialogs for the sales dashboard UI and workflows.

## STRUCTURE
- auth/: login/register/protected route components.
- ui/: shadcn/radix primitives (no business logic).
- Root: feature components + dialogs (add/edit/import/export/report).

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Core orchestration | components/sales-dashboard.tsx | State + Convex hooks |
| Visualizations | components/sales-visualizations.tsx | Charts + transforms |
| Trends/forecast | components/trend-analysis.tsx | Forecast UI |
| Dashboard layout | components/customizable-dashboard.tsx | Layout prefs |
| Dialog flows | components/*-dialog.tsx | Add/import/export/report |
| Auth wrappers | components/auth/protected-route.tsx | Route guard |

## CONVENTIONS
- SalesDashboard owns shared state and passes props down.
- Dialogs are controlled via boolean props from the orchestrator.
- User feedback uses sonner toasts.

## ANTI-PATTERNS
- Do not call Convex server-only APIs from client components; use useQuery/useMutation.
- Do not call Appwrite SDK directly from feature components.
- Keep primitives in components/ui free of feature logic.
- Avoid rendering dashboard outside ProtectedRoute.

## NOTES
- Domain types (Store/Kpi/SalesData) are exported from sales-dashboard.tsx.
