import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getViewer, isSuperAdmin } from "./lib/auth";

type RollupKey = `${string}:${string}:${string}`;

function getPreviousMonthKey(now: Date) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const prev = new Date(Date.UTC(year, month - 1, 1));
  const prevYear = prev.getUTCFullYear();
  const prevMonth = String(prev.getUTCMonth() + 1).padStart(2, "0");
  return `${prevYear}-${prevMonth}`;
}

export const rollupMonth = internalMutation({
  args: { monthKey: v.string() },
  handler: async (ctx, args) => {
    await performRollup(ctx, args.monthKey);
  },
});

export const rollupPreviousMonth = internalMutation({
  args: {},
  handler: async (ctx) => {
    const monthKey = getPreviousMonthKey(new Date());
    await performRollup(ctx, monthKey);
  },
});

export const runRollup = mutation({
  args: { monthKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    if (!(await isSuperAdmin(ctx, viewer.userId))) {
      throw new Error("Forbidden");
    }

    const monthKey = args.monthKey ?? getPreviousMonthKey(new Date());
    await performRollup(ctx, monthKey);
    return { monthKey };
  },
});

async function performRollup(ctx: MutationCtx, monthKey: string) {
  const rows = await ctx.db
    .query("daily_sales")
    .withIndex("by_month", (q) => q.eq("monthKey", monthKey))
    .collect();

  const rollups = new Map<RollupKey, { orgId: typeof rows[number]["orgId"]; storeId: typeof rows[number]["storeId"]; kpiId: typeof rows[number]["kpiId"]; totalSales: number; monthlyGoal: number; daysRecorded: Set<string> }>();

  rows.forEach((row) => {
    const key = `${row.orgId}:${row.storeId}:${row.kpiId}` as RollupKey;
    const existing = rollups.get(key);
    if (!existing) {
      rollups.set(key, {
        orgId: row.orgId,
        storeId: row.storeId,
        kpiId: row.kpiId,
        totalSales: row.dailyValue,
        monthlyGoal: row.monthlyGoal,
        daysRecorded: new Set([row.dateKey]),
      });
      return;
    }

    existing.totalSales += row.dailyValue;
    existing.monthlyGoal = Math.max(existing.monthlyGoal, row.monthlyGoal);
    existing.daysRecorded.add(row.dateKey);
  });

  const closedAt = Date.now();

  for (const rollup of rollups.values()) {
    const existing = await ctx.db
      .query("monthly_rollups")
      .withIndex("by_org_store_kpi_month", (q) =>
        q.eq("orgId", rollup.orgId).eq("storeId", rollup.storeId).eq("kpiId", rollup.kpiId).eq("monthKey", monthKey),
      )
      .unique();

    const payload = {
      totalSales: rollup.totalSales,
      monthlyGoal: rollup.monthlyGoal,
      daysRecorded: rollup.daysRecorded.size,
      closedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("monthly_rollups", {
        orgId: rollup.orgId,
        storeId: rollup.storeId,
        kpiId: rollup.kpiId,
        monthKey,
        ...payload,
      });
    }
  }
}
