import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer, isSuperAdmin } from "./lib/auth";

export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      return null;
    }

    const role = await ctx.db
      .query("appRoles")
      .withIndex("by_user", (q) => q.eq("userId", viewer.userId))
      .unique();

    return role?.role ?? null;
  },
});

export const bootstrapSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db.query("appRoles").first();
    if (existing) {
      throw new Error("Super admin already initialized");
    }

    await ctx.db.insert("appRoles", {
      userId: viewer.userId,
      role: "super_admin",
    });

    return { userId: viewer.userId, role: "super_admin" };
  },
});

export const bootstrapSuperAdminForEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    if (!viewer.email || viewer.email.toLowerCase() !== args.email.toLowerCase()) {
      throw new Error("Email mismatch");
    }

    const existing = await ctx.db.query("appRoles").first();
    if (existing) {
      throw new Error("Super admin already initialized");
    }

    await ctx.db.insert("appRoles", {
      userId: viewer.userId,
      role: "super_admin",
    });

    return { userId: viewer.userId, role: "super_admin" };
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("super_admin")),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    if (!(await isSuperAdmin(ctx, viewer.userId))) {
      throw new Error("Forbidden");
    }

    const existing = await ctx.db
      .query("appRoles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
      return { userId: args.userId, role: args.role };
    }

    await ctx.db.insert("appRoles", {
      userId: args.userId,
      role: args.role,
    });

    return { userId: args.userId, role: args.role };
  },
});
