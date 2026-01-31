import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, assertOrgRole, getViewerByWorkosId } from "./lib/auth";

export const listKpis = query({
  args: { orgId: v.string(), workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      return [];
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
    if (!viewer) {
      return [];
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    return await ctx.db
      .query("kpis")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createKpi = mutation({
  args: { orgId: v.string(), name: v.string(), workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    return await ctx.db.insert("kpis", {
      orgId: args.orgId,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

export const deleteKpi = mutation({
  args: { orgId: v.string(), kpiId: v.string(), workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Require admin or owner role to delete KPIs
    await assertOrgRole(ctx, args.orgId, viewer, "admin");

    const kpi = await ctx.db.get(args.kpiId as any);
    if (!kpi || (kpi as any).orgId !== args.orgId) {
      throw new Error("KPI not found");
    }

    await ctx.db.delete(args.kpiId as any);
  },
});
