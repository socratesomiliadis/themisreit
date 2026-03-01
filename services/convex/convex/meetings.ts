import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

function now() {
  return Date.now();
}

function randomToken(length: number) {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";

  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return out;
}

function makeCallId() {
  return `meet_${Date.now()}_${randomToken(8).toLowerCase()}`;
}

function makeInviteCode() {
  return `${randomToken(6)}-${randomToken(6)}`;
}

function makeGuestSessionToken() {
  return `${randomToken(10)}${randomToken(10)}${randomToken(10)}`;
}

function normalizeEmail(email: string | undefined) {
  const cleaned = email?.trim().toLowerCase();
  return cleaned ? cleaned : undefined;
}

function meetingTitle(title: string | undefined, kind: "instant" | "scheduled") {
  const value = title?.trim();
  if (value) {
    return value;
  }

  return kind === "instant" ? "Instant meeting" : "Scheduled meeting";
}

function isMeetingEnded(meeting: Doc<"meetings">) {
  return typeof meeting.endedAt === "number";
}

function assertMeetingNotEnded(meeting: Doc<"meetings">) {
  if (isMeetingEnded(meeting)) {
    throw new Error("This meeting has already ended.");
  }
}

function isInviteActive(invite: Doc<"meetingInvites">, timestamp: number) {
  if (invite.revokedAt) {
    return false;
  }

  if (invite.expiresAt && invite.expiresAt <= timestamp) {
    return false;
  }

  if (typeof invite.maxUses === "number" && invite.usedCount >= invite.maxUses) {
    return false;
  }

  return true;
}

async function getAuthDetails(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return {
    clerkId: identity.subject,
    email: normalizeEmail((identity as { email?: string }).email),
  };
}

async function requireAuthDetails(ctx: QueryCtx | MutationCtx) {
  const auth = await getAuthDetails(ctx);
  if (!auth) {
    throw new Error("You must be signed in to perform this action.");
  }

  return auth;
}

async function getMeetingByCallId(
  ctx: QueryCtx | MutationCtx,
  callId: string,
): Promise<Doc<"meetings"> | null> {
  return await ctx.db
    .query("meetings")
    .withIndex("by_callId", (q) => q.eq("callId", callId))
    .unique();
}

async function generateUniqueCallId(ctx: MutationCtx) {
  for (let i = 0; i < 12; i += 1) {
    const callId = makeCallId();
    const existing = await getMeetingByCallId(ctx, callId);
    if (!existing) {
      return callId;
    }
  }

  throw new Error("Could not allocate a unique call id.");
}

async function getInviteByCode(
  ctx: QueryCtx | MutationCtx,
  inviteCode: string,
): Promise<Doc<"meetingInvites"> | null> {
  return await ctx.db
    .query("meetingInvites")
    .withIndex("by_code", (q) => q.eq("code", inviteCode.toUpperCase()))
    .unique();
}

async function generateUniqueInviteCode(ctx: MutationCtx) {
  for (let i = 0; i < 12; i += 1) {
    const code = makeInviteCode();
    const existing = await getInviteByCode(ctx, code);
    if (!existing) {
      return code;
    }
  }

  throw new Error("Could not generate a unique invite code.");
}

async function getOrCreateMeetingParticipant(
  ctx: MutationCtx,
  meetingId: Id<"meetings">,
  clerkId: string,
) {
  const existing = await ctx.db
    .query("meetingParticipants")
    .withIndex("by_meeting_and_clerk", (q) => q.eq("meetingId", meetingId).eq("clerkId", clerkId))
    .unique();

  if (existing) {
    return { participant: existing, created: false };
  }

  const participantId = await ctx.db.insert("meetingParticipants", {
    meetingId,
    kind: "clerk",
    clerkId,
    role: "participant",
    createdAt: now(),
  });

  const participant = await ctx.db.get(participantId);
  if (!participant) {
    throw new Error("Could not create participant.");
  }

  return { participant, created: true };
}

async function assertMeetingHost(
  ctx: QueryCtx | MutationCtx,
  meetingId: Id<"meetings">,
  clerkId: string,
): Promise<Doc<"meetings">> {
  const meeting = await ctx.db.get(meetingId);
  if (!meeting) {
    throw new Error("Meeting not found.");
  }

  if (meeting.createdByClerkId === clerkId) {
    return meeting;
  }

  const participant = await ctx.db
    .query("meetingParticipants")
    .withIndex("by_meeting_and_clerk", (q) => q.eq("meetingId", meetingId).eq("clerkId", clerkId))
    .unique();

  if (participant?.role !== "host") {
    throw new Error("You do not have permission to manage this meeting.");
  }

  return meeting;
}

async function canAccessMeeting(
  ctx: QueryCtx,
  meetingId: Id<"meetings">,
  clerkId: string,
): Promise<boolean> {
  const meeting = await ctx.db.get(meetingId);
  if (!meeting) {
    return false;
  }

  if (meeting.createdByClerkId === clerkId) {
    return true;
  }

  const participant = await ctx.db
    .query("meetingParticipants")
    .withIndex("by_meeting_and_clerk", (q) => q.eq("meetingId", meetingId).eq("clerkId", clerkId))
    .unique();

  return Boolean(participant);
}

async function findUserProfile(ctx: QueryCtx | MutationCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export const createInstantMeeting = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    transcriptionEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const timestamp = now();
    const callId = await generateUniqueCallId(ctx);

    const meetingId = await ctx.db.insert("meetings", {
      callId,
      callType: "default",
      title: meetingTitle(args.title, "instant"),
      description: args.description?.trim() || undefined,
      transcriptionEnabled: Boolean(args.transcriptionEnabled),
      kind: "instant",
      startsAt: timestamp,
      createdByClerkId: auth.clerkId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await ctx.db.insert("meetingParticipants", {
      meetingId,
      kind: "clerk",
      clerkId: auth.clerkId,
      role: "host",
      createdAt: timestamp,
      joinedAt: timestamp,
    });

    return { meetingId, callId };
  },
});

export const scheduleMeeting = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startsAt: v.number(),
    transcriptionEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const timestamp = now();

    if (args.startsAt <= timestamp - 60_000) {
      throw new Error("Scheduled time must be in the future.");
    }

    const callId = await generateUniqueCallId(ctx);

    const meetingId = await ctx.db.insert("meetings", {
      callId,
      callType: "default",
      title: meetingTitle(args.title, "scheduled"),
      description: args.description?.trim() || undefined,
      transcriptionEnabled: Boolean(args.transcriptionEnabled),
      kind: "scheduled",
      startsAt: args.startsAt,
      createdByClerkId: auth.clerkId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await ctx.db.insert("meetingParticipants", {
      meetingId,
      kind: "clerk",
      clerkId: auth.clerkId,
      role: "host",
      createdAt: timestamp,
    });

    return { meetingId, callId };
  },
});

export const createInvite = mutation({
  args: {
    meetingId: v.id("meetings"),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    maxUses: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const timestamp = now();

    const meeting = await assertMeetingHost(ctx, args.meetingId, auth.clerkId);
    assertMeetingNotEnded(meeting);

    if (typeof args.maxUses === "number" && args.maxUses <= 0) {
      throw new Error("maxUses must be greater than zero.");
    }

    if (args.expiresAt && args.expiresAt <= timestamp) {
      throw new Error("expiresAt must be in the future.");
    }

    const code = await generateUniqueInviteCode(ctx);
    const inviteId = await ctx.db.insert("meetingInvites", {
      meetingId: args.meetingId,
      code,
      email: normalizeEmail(args.email),
      displayName: args.displayName?.trim() || undefined,
      invitedByClerkId: auth.clerkId,
      createdAt: timestamp,
      expiresAt: args.expiresAt,
      maxUses: args.maxUses,
      usedCount: 0,
    });

    const invite = await ctx.db.get(inviteId);
    if (!invite) {
      throw new Error("Could not create invite.");
    }

    return invite;
  },
});

export const endMeeting = mutation({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const timestamp = now();
    const meeting = await assertMeetingHost(ctx, args.meetingId, auth.clerkId);

    if (isMeetingEnded(meeting)) {
      return {
        meetingId: meeting._id,
        callId: meeting.callId,
        endedAt: meeting.endedAt,
      };
    }

    await ctx.db.patch(meeting._id, {
      endedAt: timestamp,
      endedByClerkId: auth.clerkId,
      updatedAt: timestamp,
    });

    return {
      meetingId: meeting._id,
      callId: meeting.callId,
      endedAt: timestamp,
    };
  },
});

export const getMeetingForEnding = internalQuery({
  args: {
    meetingId: v.id("meetings"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await assertMeetingHost(ctx, args.meetingId, args.clerkId);

    return {
      meetingId: meeting._id,
      callId: meeting.callId,
      callType: meeting.callType,
      endedAt: meeting.endedAt,
      transcriptionEnabled: meeting.transcriptionEnabled,
    };
  },
});

export const finalizeEndedMeeting = internalMutation({
  args: {
    meetingId: v.id("meetings"),
    clerkId: v.string(),
    endedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const meeting = await assertMeetingHost(ctx, args.meetingId, args.clerkId);

    if (isMeetingEnded(meeting)) {
      return {
        meetingId: meeting._id,
        callId: meeting.callId,
        endedAt: meeting.endedAt,
      };
    }

    await ctx.db.patch(meeting._id, {
      endedAt: args.endedAt,
      endedByClerkId: args.clerkId,
      updatedAt: args.endedAt,
    });

    return {
      meetingId: meeting._id,
      callId: meeting.callId,
      endedAt: args.endedAt,
    };
  },
});

export const revokeInvite = mutation({
  args: {
    inviteId: v.id("meetingInvites"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite) {
      throw new Error("Invite not found.");
    }

    await assertMeetingHost(ctx, invite.meetingId, auth.clerkId);

    if (!invite.revokedAt) {
      await ctx.db.patch(invite._id, { revokedAt: now() });
    }

    return { ok: true };
  },
});

export const listForViewer = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuthDetails(ctx);

    const byCreator = await ctx.db
      .query("meetings")
      .withIndex("by_creator", (q) => q.eq("createdByClerkId", auth.clerkId))
      .collect();

    const participantRecords = await ctx.db
      .query("meetingParticipants")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", auth.clerkId))
      .collect();

    const meetingById = new Map<Id<"meetings">, Doc<"meetings">>();

    for (const meeting of byCreator) {
      meetingById.set(meeting._id, meeting);
    }

    for (const participant of participantRecords) {
      if (meetingById.has(participant.meetingId)) {
        continue;
      }

      const meeting = await ctx.db.get(participant.meetingId);
      if (meeting) {
        meetingById.set(meeting._id, meeting);
      }
    }

    const rows = await Promise.all(
      [...meetingById.values()].map(async (meeting) => {
        const invites = await ctx.db
          .query("meetingInvites")
          .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
          .collect();

        invites.sort((a, b) => b.createdAt - a.createdAt);

        return {
          _id: meeting._id,
          callId: meeting.callId,
          title: meeting.title,
          description: meeting.description,
          transcriptionEnabled: meeting.transcriptionEnabled,
          kind: meeting.kind,
          startsAt: meeting.startsAt,
          endedAt: meeting.endedAt,
          endedByClerkId: meeting.endedByClerkId,
          createdAt: meeting.createdAt,
          invites,
        };
      }),
    );

    rows.sort((a, b) => {
      const aTime = a.startsAt ?? a.createdAt;
      const bTime = b.startsAt ?? b.createdAt;
      return bTime - aTime;
    });

    return rows;
  },
});

export const getInviteLanding = query({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await getInviteByCode(ctx, args.inviteCode);
    if (!invite) {
      return null;
    }

    const timestamp = now();
    if (!isInviteActive(invite, timestamp)) {
      return null;
    }

    const meeting = await ctx.db.get(invite.meetingId);
    if (!meeting) {
      return null;
    }
    if (isMeetingEnded(meeting)) {
      return null;
    }

    return {
      meetingTitle: meeting.title,
      meetingKind: meeting.kind,
      startsAt: meeting.startsAt,
      callId: meeting.callId,
      inviteDisplayName: invite.displayName,
      restrictedEmail: invite.email,
    };
  },
});

export const createGuestSessionFromInvite = mutation({
  args: {
    inviteCode: v.string(),
    guestName: v.string(),
  },
  handler: async (ctx, args) => {
    const cleanedName = args.guestName.trim();
    if (cleanedName.length < 2 || cleanedName.length > 80) {
      throw new Error("Guest name must be between 2 and 80 characters.");
    }

    const invite = await getInviteByCode(ctx, args.inviteCode);
    if (!invite) {
      throw new Error("Invite does not exist.");
    }

    const timestamp = now();
    if (!isInviteActive(invite, timestamp)) {
      throw new Error("This invite is no longer active.");
    }

    if (invite.email) {
      throw new Error(
        "This invite is email-restricted. Join with your Clerk account instead of guest mode.",
      );
    }

    const meeting = await ctx.db.get(invite.meetingId);
    if (!meeting) {
      throw new Error("Meeting not found for this invite.");
    }
    assertMeetingNotEnded(meeting);

    const sessionToken = makeGuestSessionToken();
    const streamUserId = `guest_${randomToken(12).toLowerCase()}`;

    const sessionId = await ctx.db.insert("meetingGuestSessions", {
      meetingId: meeting._id,
      inviteId: invite._id,
      sessionToken,
      guestName: cleanedName,
      streamUserId,
      createdAt: timestamp,
      lastJoinedAt: timestamp,
    });

    await ctx.db.insert("meetingParticipants", {
      meetingId: meeting._id,
      kind: "guest",
      guestName: cleanedName,
      guestSessionId: sessionId,
      role: "participant",
      createdAt: timestamp,
      joinedAt: timestamp,
    });

    await ctx.db.patch(invite._id, {
      usedCount: invite.usedCount + 1,
    });

    return {
      callId: meeting.callId,
      guestSessionToken: sessionToken,
    };
  },
});

export const acceptInviteAsAuthenticated = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const invite = await getInviteByCode(ctx, args.inviteCode);

    if (!invite) {
      throw new Error("Invite does not exist.");
    }

    const timestamp = now();
    if (!isInviteActive(invite, timestamp)) {
      throw new Error("This invite is no longer active.");
    }

    const meeting = await ctx.db.get(invite.meetingId);
    if (!meeting) {
      throw new Error("Meeting not found for this invite.");
    }
    assertMeetingNotEnded(meeting);

    if (invite.email) {
      let viewerEmail = auth.email;
      if (!viewerEmail) {
        const profile = await findUserProfile(ctx, auth.clerkId);
        viewerEmail = normalizeEmail(profile?.email);
      }

      if (!viewerEmail || viewerEmail !== invite.email) {
        throw new Error("This invite is restricted to a different email address.");
      }
    }

    const { participant, created } = await getOrCreateMeetingParticipant(
      ctx,
      meeting._id,
      auth.clerkId,
    );

    await ctx.db.patch(participant._id, {
      joinedAt: timestamp,
    });

    if (created) {
      await ctx.db.patch(invite._id, {
        usedCount: invite.usedCount + 1,
      });
    }

    return {
      callId: meeting.callId,
    };
  },
});

export const getMeetingForCall = query({
  args: {
    callId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthDetails(ctx);
    if (!auth) {
      return null;
    }

    const meeting = await getMeetingByCallId(ctx, args.callId);
    if (!meeting) {
      return null;
    }
    if (isMeetingEnded(meeting)) {
      return null;
    }

    const canJoin = await canAccessMeeting(ctx, meeting._id, auth.clerkId);
    if (!canJoin) {
      return null;
    }

    return {
      _id: meeting._id,
      callId: meeting.callId,
      title: meeting.title,
      transcriptionEnabled: meeting.transcriptionEnabled,
      kind: meeting.kind,
      startsAt: meeting.startsAt,
      endedAt: meeting.endedAt,
    };
  },
});

export const getRoomStatus = query({
  args: {
    callId: v.string(),
    guestSessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const meeting = await getMeetingByCallId(ctx, args.callId);
    if (!meeting) {
      return null;
    }

    const auth = await getAuthDetails(ctx);
    if (auth) {
      const canJoin = await canAccessMeeting(ctx, meeting._id, auth.clerkId);
      if (!canJoin) {
        return null;
      }

      return {
        callId: meeting.callId,
        title: meeting.title,
        endedAt: meeting.endedAt,
      };
    }

    const guestSessionToken = args.guestSessionToken;
    if (!guestSessionToken) {
      return null;
    }

    const guestSession = await ctx.db
      .query("meetingGuestSessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", guestSessionToken))
      .unique();

    if (!guestSession || guestSession.meetingId !== meeting._id) {
      return null;
    }

    return {
      callId: meeting.callId,
      title: meeting.title,
      endedAt: meeting.endedAt,
    };
  },
});

export const resolveAuthenticatedJoiner = internalQuery({
  args: {
    callId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await getMeetingByCallId(ctx, args.callId);
    if (!meeting) {
      return null;
    }
    if (isMeetingEnded(meeting)) {
      return null;
    }

    const participant = await ctx.db
      .query("meetingParticipants")
      .withIndex("by_meeting_and_clerk", (q) =>
        q.eq("meetingId", meeting._id).eq("clerkId", args.clerkId),
      )
      .unique();

    const isCreator = meeting.createdByClerkId === args.clerkId;
    const allowed = isCreator || Boolean(participant);

    if (!allowed) {
      return null;
    }

    const profile = await findUserProfile(ctx, args.clerkId);
    const fallbackName = profile?.email ? profile.email.split("@")[0] : args.clerkId.slice(0, 8);
    const composedName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();

    return {
      meetingId: meeting._id,
      canManageCallSettings: isCreator || participant?.role === "host",
      meeting: {
        title: meeting.title,
        kind: meeting.kind,
        startsAt: meeting.startsAt,
        transcriptionEnabled: meeting.transcriptionEnabled,
      },
      call: {
        callId: meeting.callId,
        callType: meeting.callType,
      },
      streamUser: {
        id: `clerk_${args.clerkId}`,
        name: composedName || profile?.username || fallbackName,
        image: profile?.imageUrl,
      },
    };
  },
});

export const resolveGuestJoiner = internalQuery({
  args: {
    callId: v.string(),
    guestSessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await getMeetingByCallId(ctx, args.callId);
    if (!meeting) {
      return null;
    }
    if (isMeetingEnded(meeting)) {
      return null;
    }

    const session = await ctx.db
      .query("meetingGuestSessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.guestSessionToken))
      .unique();

    if (!session || session.meetingId !== meeting._id) {
      return null;
    }

    return {
      meetingId: meeting._id,
      sessionId: session._id,
      meeting: {
        title: meeting.title,
        kind: meeting.kind,
        startsAt: meeting.startsAt,
        transcriptionEnabled: meeting.transcriptionEnabled,
      },
      call: {
        callId: meeting.callId,
        callType: meeting.callType,
      },
      streamUser: {
        id: session.streamUserId,
        name: session.guestName,
      },
    };
  },
});

export const touchAuthenticatedParticipant = internalMutation({
  args: {
    meetingId: v.id("meetings"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    const existing = await ctx.db
      .query("meetingParticipants")
      .withIndex("by_meeting_and_clerk", (q) =>
        q.eq("meetingId", args.meetingId).eq("clerkId", args.clerkId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { joinedAt: timestamp });
      return existing._id;
    }

    return await ctx.db.insert("meetingParticipants", {
      meetingId: args.meetingId,
      kind: "clerk",
      clerkId: args.clerkId,
      role: "participant",
      createdAt: timestamp,
      joinedAt: timestamp,
    });
  },
});

export const touchGuestSession = internalMutation({
  args: {
    meetingId: v.id("meetings"),
    sessionId: v.id("meetingGuestSessions"),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.meetingId !== args.meetingId) {
      throw new Error("Guest session is invalid for this meeting.");
    }

    await ctx.db.patch(session._id, {
      lastJoinedAt: timestamp,
    });

    const participant = await ctx.db
      .query("meetingParticipants")
      .withIndex("by_guest_session", (q) => q.eq("guestSessionId", session._id))
      .unique();

    if (participant) {
      await ctx.db.patch(participant._id, {
        joinedAt: timestamp,
      });
      return participant._id;
    }

    return await ctx.db.insert("meetingParticipants", {
      meetingId: args.meetingId,
      kind: "guest",
      guestName: session.guestName,
      guestSessionId: session._id,
      role: "participant",
      createdAt: timestamp,
      joinedAt: timestamp,
    });
  },
});

export const upsertMeetingTranscript = internalMutation({
  args: {
    meetingId: v.id("meetings"),
    streamCallSessionId: v.string(),
    filename: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    text: v.string(),
    syncedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("meetingTranscripts")
      .withIndex("by_meeting_and_file", (q) =>
        q
          .eq("meetingId", args.meetingId)
          .eq("streamCallSessionId", args.streamCallSessionId)
          .eq("filename", args.filename),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        startTime: args.startTime,
        endTime: args.endTime,
        text: args.text,
        syncedAt: args.syncedAt,
        updatedAt: args.syncedAt,
      });

      return existing._id;
    }

    return await ctx.db.insert("meetingTranscripts", {
      meetingId: args.meetingId,
      streamCallSessionId: args.streamCallSessionId,
      filename: args.filename,
      startTime: args.startTime,
      endTime: args.endTime,
      text: args.text,
      syncedAt: args.syncedAt,
      updatedAt: args.syncedAt,
    });
  },
});

export const listMeetingTranscripts = query({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuthDetails(ctx);
    const canAccess = await canAccessMeeting(ctx, args.meetingId, auth.clerkId);
    if (!canAccess) {
      throw new Error("You do not have permission to view this meeting transcripts.");
    }

    const transcripts = await ctx.db
      .query("meetingTranscripts")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    transcripts.sort((a, b) => b.syncedAt - a.syncedAt);
    return transcripts;
  },
});
