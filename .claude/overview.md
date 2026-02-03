# Overview

Sales Dashboard is a modern sales tracking and analytics dashboard for multi-store KPI management. Users can define stores and custom KPIs, track month-to-date (MTD) sales against goals, visualize performance with interactive charts, generate PDF reports, and import/export CSV data.

## Core Workflows
1. User authenticates via WorkOS AuthKit → auto-creates organization on first login
2. User adds stores and KPIs → system creates default sales data entries
3. User enters daily MTD sales and monthly goals → stored in `daily_sales` table
4. Dashboard displays real-time calculations: % to goal, projections, trends
5. User generates PDF reports → uploaded to Vercel Blob → metadata stored in Convex
