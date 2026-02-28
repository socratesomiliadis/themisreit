import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsert = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("organizations", args);
  },
});

export const remove = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (org) {
      // Also remove all memberships for this org
      const memberships = await ctx.db
        .query("organizationMembers")
        .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", clerkId))
        .collect();

      for (const membership of memberships) {
        await ctx.db.delete(membership._id);
      }

      await ctx.db.delete(org._id);
    }
  },
});

export const upsertMember = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_and_user", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
      return existing._id;
    }

    return await ctx.db.insert("organizationMembers", args);
  },
});

export const removeMember = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkOrgId, clerkUserId }) => {
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_and_user", (q) =>
        q.eq("clerkOrgId", clerkOrgId).eq("clerkUserId", clerkUserId),
      )
      .unique();

    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});
