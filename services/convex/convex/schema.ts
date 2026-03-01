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

  meetings: defineTable({
    callId: v.string(),
    callType: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    transcriptionEnabled: v.boolean(),
    kind: v.union(v.literal("instant"), v.literal("scheduled")),
    startsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    endedByClerkId: v.optional(v.string()),
    createdByClerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_callId", ["callId"])
    .index("by_creator", ["createdByClerkId"])
    .index("by_startsAt", ["startsAt"]),

  meetingTranscripts: defineTable({
    meetingId: v.id("meetings"),
    streamCallSessionId: v.string(),
    filename: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    text: v.string(),
    syncedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_meeting_and_file", ["meetingId", "streamCallSessionId", "filename"]),

  meetingInvites: defineTable({
    meetingId: v.id("meetings"),
    code: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    invitedByClerkId: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    usedCount: v.number(),
    maxUses: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_meeting", ["meetingId"]),

  meetingGuestSessions: defineTable({
    meetingId: v.id("meetings"),
    inviteId: v.id("meetingInvites"),
    sessionToken: v.string(),
    guestName: v.string(),
    streamUserId: v.string(),
    createdAt: v.number(),
    lastJoinedAt: v.optional(v.number()),
  })
    .index("by_sessionToken", ["sessionToken"])
    .index("by_meeting", ["meetingId"]),

  meetingParticipants: defineTable({
    meetingId: v.id("meetings"),
    kind: v.union(v.literal("clerk"), v.literal("guest")),
    clerkId: v.optional(v.string()),
    guestName: v.optional(v.string()),
    guestSessionId: v.optional(v.id("meetingGuestSessions")),
    role: v.union(v.literal("host"), v.literal("participant")),
    invitedByClerkId: v.optional(v.string()),
    joinedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_clerkId", ["clerkId"])
    .index("by_meeting_and_clerk", ["meetingId", "clerkId"])
    .index("by_guest_session", ["guestSessionId"]),
});
