import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  organizations: defineTable({
    clerkId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  organizationMembers: defineTable({
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.string(),
  })
    .index("by_clerkOrgId", ["clerkOrgId"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_org_and_user", ["clerkOrgId", "clerkUserId"]),
});
