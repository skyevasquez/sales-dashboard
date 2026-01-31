import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getViewerByWorkosId, isSuperAdmin } from "./lib/auth";

const BOOTSTRAP_ADMIN_EMAIL = "skye@applylogics.com";

export const getMyRole = query({
  args: { workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      return null;
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
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
  args: { workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
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
  args: { email: v.string(), workosUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.workosUserId) {
      throw new Error("Unauthorized: workosUserId required");
    }
    const viewer = await getViewerByWorkosId(ctx, args.workosUserId);
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

export const initializeAdminOnLogin = internalMutation({
  args: { workosUserId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    if (args.email.toLowerCase() !== BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      return { isAdmin: false };
    }

    const existingRole = await ctx.db
      .query("appRoles")
      .withIndex("by_user", (q) => q.eq("userId", args.workosUserId))
      .first();

    if (existingRole) {
      if (existingRole.role !== "super_admin") {
        await ctx.db.patch(existingRole._id, { role: "super_admin" });
      }
      return { isAdmin: true, existing: true };
    }

    await ctx.db.insert("appRoles", {
      userId: args.workosUserId,
      role: "super_admin",
    });

    return { isAdmin: true, existing: false };
  },
});
