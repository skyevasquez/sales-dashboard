import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOrgAccess, getViewer, isSuperAdmin } from "./lib/auth";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const listOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    if (await isSuperAdmin(ctx, viewer.userId)) {
      return await ctx.db.query("organizations").collect();
    }

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", viewer.userId))
      .collect();

    const organizations = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.orgId)),
    );

    return organizations.filter((org) => org !== null);
  },
});

export const getOrganization = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);
    return await ctx.db.get(args.orgId);
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    const slug = (args.slug && toSlug(args.slug)) || toSlug(args.name);
    if (!slug) {
      throw new Error("Invalid organization slug");
    }

    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      throw new Error("Organization slug already exists");
    }

    const now = Date.now();
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug,
      ownerId: viewer.userId,
      createdAt: now,
    });

    await ctx.db.insert("members", {
      orgId,
      userId: viewer.userId,
      role: "owner",
      joinedAt: now,
    });

    return orgId;
  },
});
