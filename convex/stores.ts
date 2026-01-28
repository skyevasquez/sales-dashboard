import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, assertOrgRole, getViewer } from "./lib/auth";

export const listStores = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    return await ctx.db
      .query("stores")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createStore = mutation({
  args: { orgId: v.id("organizations"), name: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
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
  args: { orgId: v.id("organizations"), storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Require admin or owner role to delete stores
    await assertOrgRole(ctx, args.orgId, viewer, "admin");

    const store = await ctx.db.get(args.storeId);
    if (!store || store.orgId !== args.orgId) {
      throw new Error("Store not found");
    }

    await ctx.db.delete(args.storeId);
  },
});
