import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, assertOrgRole, getViewer } from "./lib/auth";

export const listReports = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    return await ctx.db
      .query("reports")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createReport = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    url: v.string(),
    storeIds: v.array(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    return await ctx.db.insert("reports", {
      orgId: args.orgId,
      name: args.name,
      url: args.url,
      storeIds: args.storeIds,
      createdAt: Date.now(),
    });
  },
});

export const deleteReport = mutation({
  args: { orgId: v.id("organizations"), reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Require admin or owner role to delete reports
    await assertOrgRole(ctx, args.orgId, viewer, "admin");

    const report = await ctx.db.get(args.reportId);
    if (!report || report.orgId !== args.orgId) {
      throw new Error("Report not found");
    }

    await ctx.db.delete(args.reportId);
  },
});
