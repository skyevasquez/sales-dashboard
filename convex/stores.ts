import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, assertOrgRole, getViewerByWorkosId } from "./lib/auth";

export const listStores = query({
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
      .query("stores")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createStore = mutation({
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

    return await ctx.db.insert("stores", {
      orgId: args.orgId,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

export const deleteStore = mutation({
  args: { orgId: v.string(), storeId: v.string(), workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Require admin or owner role to delete stores
    await assertOrgRole(ctx, args.orgId, viewer, "admin");

    const store = await ctx.db.get(args.storeId as any);
    if (!store || (store as any).orgId !== args.orgId) {
      throw new Error("Store not found");
    }

    await ctx.db.delete(args.storeId as any);
  },
});
