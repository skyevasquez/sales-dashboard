# Development & Ops

## Prerequisites
- Node.js 18+
- npm
- Convex account

## Environment Variables (`.env.local`)
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

## Commands
```bash
npm install --legacy-peer-deps
npx convex dev
npm run dev
npm run build
npm start
npm run lint
```

## Troubleshooting
- **Unauthorized**: ensure `npx convex dev` is running and `NEXT_PUBLIC_CONVEX_URL` is correct
- **Type errors after schema change**: run `npx convex dev` to regenerate types
- **Build failures**: build ignores TS errors by design; check runtime errors in console
