import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, assertOrgRole, getViewer } from "./lib/auth";

export const listKpis = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    return await ctx.db
      .query("kpis")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createKpi = mutation({
  args: { orgId: v.id("organizations"), name: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
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
  args: { orgId: v.id("organizations"), kpiId: v.id("kpis") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Require admin or owner role to delete KPIs
    await assertOrgRole(ctx, args.orgId, viewer, "admin");

    const kpi = await ctx.db.get(args.kpiId);
    if (!kpi || kpi.orgId !== args.orgId) {
      throw new Error("KPI not found");
    }

    await ctx.db.delete(args.kpiId);
  },
});
