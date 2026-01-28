import { authComponent } from "../auth";
import { DataModel, Id } from "../_generated/dataModel";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";

type Viewer = {
  userId: string;
  email?: string | null;
  name?: string | null;
};

type DbCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export async function getViewer(ctx: DbCtx) {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    return null;
  }

  return {
    userId: user.userId ?? user._id,
    email: user.email ?? null,
    name: user.name ?? null,
  } satisfies Viewer;
}

export async function isSuperAdmin(ctx: DbCtx, userId: string) {
  const role = await ctx.db
    .query("appRoles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  return role?.role === "super_admin";
}

export async function assertOrgAccess(
  ctx: DbCtx,
  orgId: Id<"organizations">,
  viewer: Viewer,
) {
  if (await isSuperAdmin(ctx, viewer.userId)) {
    return;
  }

  const membership = await ctx.db
    .query("members")
    .withIndex("by_org_user", (q) =>
      q.eq("orgId", orgId).eq("userId", viewer.userId),
    )
    .unique();

  if (!membership) {
    throw new Error("Unauthorized");
  }
}

// Get user's role in an organization
export async function getOrgRole(
  ctx: DbCtx,
  orgId: Id<"organizations">,
  userId: string,
): Promise<"owner" | "admin" | "member" | null> {
  if (await isSuperAdmin(ctx, userId)) {
    return "owner"; // Super admins have owner-level access
  }

  const membership = await ctx.db
    .query("members")
    .withIndex("by_org_user", (q) =>
      q.eq("orgId", orgId).eq("userId", userId),
    )
    .unique();

  return membership?.role ?? null;
}

// Check if user has at least the required role level
// owner > admin > member
export async function assertOrgRole(
  ctx: DbCtx,
  orgId: Id<"organizations">,
  viewer: Viewer,
  requiredRole: "owner" | "admin" | "member",
) {
  const role = await getOrgRole(ctx, orgId, viewer.userId);

  if (!role) {
    throw new Error("Unauthorized: Not a member of this organization");
  }

  const roleHierarchy = { owner: 3, admin: 2, member: 1 };
  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    throw new Error(`Forbidden: Requires ${requiredRole} role`);
  }
}
