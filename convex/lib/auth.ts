import { v } from "convex/values";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";

type Viewer = {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

type DbCtx = GenericQueryCtx<any> | GenericMutationCtx<any>;

export async function getViewer(ctx: DbCtx): Promise<Viewer | null> {
  return null;
}

export async function getViewerByWorkosId(ctx: DbCtx, workosUserId: string): Promise<Viewer | null> {
  if (!workosUserId) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_user_id", (q: any) => q.eq("workosUserId", workosUserId))
    .unique();

  if (!user) {
    return null;
  }

  return {
    userId: user.workosUserId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  } satisfies Viewer;
}

export async function isSuperAdmin(ctx: DbCtx, userId: string) {
  const role = await ctx.db
    .query("appRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  return role?.role === "super_admin";
}

export async function assertOrgAccess(
  ctx: DbCtx,
  orgId: string,
  viewer: Viewer,
) {
  if (await isSuperAdmin(ctx, viewer.userId)) {
    return;
  }

  const membership = await ctx.db
    .query("members")
    .withIndex("by_org_user", (q: any) =>
      q.eq("orgId", orgId).eq("userId", viewer.userId),
    )
    .unique();

  if (!membership) {
    throw new Error("Unauthorized");
  }
}

export async function getOrgRole(
  ctx: DbCtx,
  orgId: string,
  userId: string,
): Promise<"owner" | "admin" | "member" | null> {
  if (await isSuperAdmin(ctx, userId)) {
    return "owner";
  }

  const membership = await ctx.db
    .query("members")
    .withIndex("by_org_user", (q: any) =>
      q.eq("orgId", orgId).eq("userId", userId),
    )
    .unique();

  return membership?.role ?? null;
}

export async function assertOrgRole(
  ctx: DbCtx,
  orgId: string,
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
