import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, assertOrgRole, getViewerByWorkosId } from "./lib/auth";

export const listReports = query({
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
      .query("reports")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createReport = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    url: v.string(),
    storeIds: v.array(v.string()),
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
  args: { orgId: v.string(), reportId: v.id("reports"), workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
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
