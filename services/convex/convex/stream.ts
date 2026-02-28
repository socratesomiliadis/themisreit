"use node";

import { createHmac } from "crypto";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const internalApi = internal as any;

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function createStreamUserToken(userId: string, secret: string) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    user_id: userId,
    iat: now - 10,
    exp: now + 60 * 60 * 4,
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = createHmac("sha256", secret).update(unsigned).digest("base64url");

  return `${unsigned}.${signature}`;
}

export const issueStreamCredentials = action({
  args: {
    callId: v.string(),
    guestSessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const streamApiKey = process.env.STREAM_API_KEY;
    const streamApiSecret = process.env.STREAM_API_SECRET;

    if (!streamApiKey || !streamApiSecret) {
      throw new Error("Missing STREAM_API_KEY or STREAM_API_SECRET in Convex environment.");
    }

    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const authJoin = await ctx.runQuery(internalApi.meetings.resolveAuthenticatedJoiner, {
        callId: args.callId,
        clerkId: identity.subject,
      });

      if (!authJoin) {
        throw new Error("You are not allowed to join this meeting.");
      }

      await ctx.runMutation(internalApi.meetings.touchAuthenticatedParticipant, {
        meetingId: authJoin.meetingId,
        clerkId: identity.subject,
      });

      return {
        apiKey: streamApiKey,
        token: createStreamUserToken(authJoin.streamUser.id, streamApiSecret),
        callId: authJoin.call.callId,
        callType: authJoin.call.callType,
        user: authJoin.streamUser,
        meeting: authJoin.meeting,
      };
    }

    if (!args.guestSessionToken) {
      throw new Error("Guest join requires a guest session token.");
    }

    const guestJoin = await ctx.runQuery(internalApi.meetings.resolveGuestJoiner, {
      callId: args.callId,
      guestSessionToken: args.guestSessionToken,
    });

    if (!guestJoin) {
      throw new Error("Guest session is invalid for this meeting.");
    }

    await ctx.runMutation(internalApi.meetings.touchGuestSession, {
      meetingId: guestJoin.meetingId,
      sessionId: guestJoin.sessionId,
    });

    return {
      apiKey: streamApiKey,
      token: createStreamUserToken(guestJoin.streamUser.id, streamApiSecret),
      callId: guestJoin.call.callId,
      callType: guestJoin.call.callType,
      user: guestJoin.streamUser,
      meeting: guestJoin.meeting,
    };
  },
});
