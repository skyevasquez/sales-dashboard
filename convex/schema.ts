import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  members: defineTable({
    orgId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"])
    .index("by_org_user", ["orgId", "userId"]),

  appRoles: defineTable({
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("super_admin")),
  }).index("by_user", ["userId"]),

  stores: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_org", ["orgId"]),

  kpis: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_org", ["orgId"]),

  daily_sales: defineTable({
    orgId: v.id("organizations"),
    storeId: v.id("stores"),
    kpiId: v.id("kpis"),
    dateKey: v.string(),
    monthKey: v.string(),
    dailyValue: v.number(),
    monthlyGoal: v.number(),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_org_date", ["orgId", "dateKey"])
    .index("by_org_store_date", ["orgId", "storeId", "dateKey"])
    .index("by_org_store_kpi_month", ["orgId", "storeId", "kpiId", "monthKey"])
    .index("by_month", ["monthKey"])
    .index("by_org_month", ["orgId", "monthKey"]),

  monthly_rollups: defineTable({
    orgId: v.id("organizations"),
    storeId: v.id("stores"),
    kpiId: v.id("kpis"),
    monthKey: v.string(),
    totalSales: v.number(),
    monthlyGoal: v.number(),
    daysRecorded: v.number(),
    closedAt: v.optional(v.number()),
  })
    .index("by_org_month", ["orgId", "monthKey"])
    .index("by_org_store_kpi_month", ["orgId", "storeId", "kpiId", "monthKey"]),

  reports: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    url: v.string(),
    storeIds: v.array(v.id("stores")),
    createdAt: v.number(),
  }).index("by_org", ["orgId"]),
});
