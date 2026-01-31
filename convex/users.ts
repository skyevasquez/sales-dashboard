import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

const BOOTSTRAP_ADMIN_EMAIL = "skye@applylogics.com";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const upsertUser = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_user_id", (q) => q.eq("workosUserId", args.workosUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        updatedAt: Date.now(),
      });
      return { userId: existing._id, isNew: false };
    }

    const userId = await ctx.db.insert("users", {
      workosUserId: args.workosUserId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      createdAt: Date.now(),
    });

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", args.workosUserId))
      .collect();

    if (memberships.length === 0) {
      const orgName = args.firstName 
        ? `${args.firstName}'s Organization`
        : `My Organization`;
      
      const baseSlug = toSlug(orgName);
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existingOrg = await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();
        
        if (!existingOrg) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const now = Date.now();
      const orgId = await ctx.db.insert("organizations", {
        name: orgName,
        slug,
        ownerId: args.workosUserId,
        createdAt: now,
      });

      await ctx.db.insert("members", {
        orgId,
        userId: args.workosUserId,
        role: "owner",
        joinedAt: now,
      });
    }

    return { userId, isNew: true };
  },
});

export const getUserByWorkosId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_user_id", (q) => q.eq("workosUserId", args.workosUserId))
      .first();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.find((u) => u.email === args.email) ?? null;
  },
});

export const setSuperAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.email === args.email);
    
    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    const existingRole = await ctx.db
      .query("appRoles")
      .withIndex("by_user", (q) => q.eq("userId", user.workosUserId))
      .first();

    if (existingRole) {
      await ctx.db.patch(existingRole._id, { role: "super_admin" });
    } else {
      await ctx.db.insert("appRoles", {
        userId: user.workosUserId,
        role: "super_admin",
      });
    }

    return { success: true, userId: user.workosUserId };
  },
});

export const bootstrapAdminOnLogin = mutation({
  args: { 
    workosUserId: v.string(),
    email: v.string() 
  },
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
