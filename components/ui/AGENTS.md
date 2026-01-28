# PROJECT KNOWLEDGE BASE

## OVERVIEW
shadcn/ui and Radix-based UI primitives plus shared UI hooks.

## STRUCTURE
- *.tsx: Atomic components (button, card, dialog, etc.).
- toaster.tsx: Toast provider.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Sidebar system | components/ui/sidebar.tsx | Large compound component |
| Chart wrapper | components/ui/chart.tsx | Recharts + CSS vars |
| Toast state | hooks/use-toast.ts | Central toast store |
| Breakpoint hook | hooks/use-mobile.tsx | md breakpoint |

## CONVENTIONS
- Use cn(...) for all class composition.
- Components use forwardRef and set displayName.
- Variants use class-variance-authority (cva).
- asChild uses Radix Slot for composition.

## ANTI-PATTERNS
- Avoid hardcoded colors; prefer theme variables.
- Do not bypass cn() for conditional classes.
- Avoid embedding feature/business logic here.

## NOTES
- Most files are client components.
- Shared UI hooks live in hooks/ (use-toast, use-mobile).
