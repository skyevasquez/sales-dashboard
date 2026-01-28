import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer, isSuperAdmin, assertOrgAccess, getOrgRole } from "./lib/auth";

// Helper to get user by ID from Better Auth users table
async function getUserById(ctx: any, userId: string): Promise<{ name?: string | null; email?: string | null } | null> {
  try {
    // Query the users table directly - Better Auth manages this table
    const user = await ctx.db.get(userId);
    if (user) {
      return { name: user.name, email: user.email };
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to find user by email
async function findUserByEmail(ctx: any, email: string): Promise<{ userId: string; name?: string | null; email?: string | null } | null> {
  // Query all users and find by email (inefficient but works for now)
  // In production, you'd want to add an index on email
  const users = await ctx.db.query("users" as any).collect();
  const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  if (user) {
    return { userId: user.userId ?? user._id, name: user.name, email: user.email };
  }
  return null;
}

// List all members of an organization
export const listMembers = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    await assertOrgAccess(ctx, args.orgId, viewer);

    const members = await ctx.db
      .query("members")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await getUserById(ctx, member.userId);

        return {
          memberId: member._id,
          userId: member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          name: user?.name ?? null,
          email: user?.email ?? null,
        };
      })
    );

    return membersWithDetails;
  },
});

// Get current user's role in a specific organization
export const getMyOrgRole = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      return null;
    }

    return await getOrgRole(ctx, args.orgId, viewer.userId);
  },
});

// Invite a member to an organization
export const inviteMember = mutation({
  args: {
    orgId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Only owners and admins can invite
    const viewerRole = await getOrgRole(ctx, args.orgId, viewer.userId);
    const canInvite = viewerRole === "owner" || viewerRole === "admin";

    if (!canInvite) {
      throw new Error("Forbidden: Insufficient permissions to invite members");
    }

    // Find user by email
    const user = await findUserByEmail(ctx, args.email);

    if (!user) {
      throw new Error("User not found. They must sign up first.");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("members")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", args.orgId).eq("userId", user.userId)
      )
      .unique();

    if (existingMembership) {
      throw new Error("User is already a member of this organization");
    }

    await ctx.db.insert("members", {
      orgId: args.orgId,
      userId: user.userId,
      role: args.role,
      joinedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update a member's role
export const updateMemberRole = mutation({
  args: {
    orgId: v.id("organizations"),
    memberId: v.id("members"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    // Only owners can change roles (or super admin)
    const viewerRole = await getOrgRole(ctx, args.orgId, viewer.userId);

    if (viewerRole !== "owner") {
      throw new Error("Forbidden: Only owners can change member roles");
    }

    // Get the member being updated
    const member = await ctx.db.get(args.memberId);
    if (!member || member.orgId !== args.orgId) {
      throw new Error("Member not found");
    }

    // Prevent removing the last owner
    if (member.role === "owner" && args.role !== "owner") {
      const members = await ctx.db
        .query("members")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .collect();
      const ownerCount = members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        throw new Error("Cannot remove the last owner");
      }
    }

    await ctx.db.patch(args.memberId, { role: args.role });
    return { success: true };
  },
});

// Remove a member from an organization
export const removeMember = mutation({
  args: {
    orgId: v.id("organizations"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    const memberToRemove = await ctx.db.get(args.memberId);
    if (!memberToRemove || memberToRemove.orgId !== args.orgId) {
      throw new Error("Member not found");
    }

    const viewerRole = await getOrgRole(ctx, args.orgId, viewer.userId);
    const isSelf = memberToRemove.userId === viewer.userId;
    const isRemovingAdmin = memberToRemove.role === "admin";
    const isRemovingOwner = memberToRemove.role === "owner";

    // Permissions:
    // - Owner: can remove admins and members, but not other owners
    // - Admin: can remove members only
    // - Anyone: can remove themselves
    if (!isSelf) {
      if (!viewerRole) {
        throw new Error("Forbidden");
      }
      if (viewerRole === "member") {
        throw new Error("Forbidden: Members cannot remove other members");
      }
      if (viewerRole === "admin" && isRemovingAdmin) {
        throw new Error("Forbidden: Admins cannot remove other admins");
      }
      if (isRemovingOwner) {
        throw new Error("Forbidden: Only owners can remove other owners");
      }
    }

    // Prevent removing the last owner
    if (memberToRemove.role === "owner") {
      const members = await ctx.db
        .query("members")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .collect();
      const ownerCount = members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        throw new Error("Cannot remove the last owner");
      }
    }

    await ctx.db.delete(args.memberId);
    return { success: true };
  },
});

// Leave an organization (for self-removal)
export const leaveOrganization = mutation({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      throw new Error("Unauthorized");
    }

    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", args.orgId).eq("userId", viewer.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this organization");
    }

    // Prevent leaving if you're the last owner
    if (membership.role === "owner") {
      const members = await ctx.db
        .query("members")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .collect();
      const ownerCount = members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        throw new Error("Cannot leave: You are the last owner. Transfer ownership first.");
      }
    }

    await ctx.db.delete(membership._id);
    return { success: true };
  },
});
