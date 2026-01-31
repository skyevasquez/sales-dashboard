import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, getViewerByWorkosId } from "./lib/auth";

export const getSalesSummary = query({
  args: {
    orgId: v.string(),
    monthKey: v.string(),
    workosUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      return [];
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
    if (!viewer) {
      return [];
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    const rows = await ctx.db
      .query("daily_sales")
      .withIndex("by_org_month", (q) =>
        q.eq("orgId", args.orgId).eq("monthKey", args.monthKey),
      )
      .collect();

    const summary = new Map<string, { storeId: typeof rows[number]["storeId"]; kpiId: typeof rows[number]["kpiId"]; monthlyGoal: number; mtdSales: number }>();

    rows.forEach((row) => {
      const key = `${row.storeId}:${row.kpiId}`;
      const existing = summary.get(key);
      if (!existing) {
        summary.set(key, {
          storeId: row.storeId,
          kpiId: row.kpiId,
          monthlyGoal: row.monthlyGoal,
          mtdSales: row.dailyValue,
        });
        return;
      }

      existing.mtdSales += row.dailyValue;
      existing.monthlyGoal = Math.max(existing.monthlyGoal, row.monthlyGoal);
    });

    return Array.from(summary.values());
  },
});

export const upsertFromMtd = mutation({
  args: {
    orgId: v.string(),
    storeId: v.string(),
    kpiId: v.string(),
    dateKey: v.string(),
    monthKey: v.string(),
    mtdSales: v.number(),
    monthlyGoal: v.number(),
    workosUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    const monthRows = await ctx.db
      .query("daily_sales")
      .withIndex("by_org_store_kpi_month", (q) =>
        q
          .eq("orgId", args.orgId)
          .eq("storeId", args.storeId)
          .eq("kpiId", args.kpiId)
          .eq("monthKey", args.monthKey),
      )
      .collect();

    let existingDoc = null as (typeof monthRows)[number] | null;
    let totalWithoutTarget = 0;

    monthRows.forEach((row) => {
      if (row.dateKey === args.dateKey) {
        existingDoc = row;
        return;
      }
      totalWithoutTarget += row.dailyValue;
    });

    const dailyValue = Math.max(args.mtdSales - totalWithoutTarget, 0);
    const now = Date.now();

    if (existingDoc) {
      await ctx.db.patch(existingDoc._id, {
        dailyValue,
        monthlyGoal: args.monthlyGoal,
        createdBy: viewer.userId,
      });
      return existingDoc._id;
    }

    return await ctx.db.insert("daily_sales", {
      orgId: args.orgId,
      storeId: args.storeId,
      kpiId: args.kpiId,
      dateKey: args.dateKey,
      monthKey: args.monthKey,
      dailyValue,
      monthlyGoal: args.monthlyGoal,
      createdBy: viewer.userId,
      createdAt: now,
    });
  },
});
