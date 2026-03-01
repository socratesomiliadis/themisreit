"use node";

import { createHmac } from "crypto";
import { v } from "convex/values";
import { StreamChat } from "stream-chat";
import { action, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

const internalApi = internal as any;
const CHAT_CHANNEL_TYPE = "messaging";
const TRANSCRIPT_CONTENT_MAX_CHARS = 180_000;

function readRequiredEnv(name: "STREAM_API_KEY" | "STREAM_API_SECRET") {
  const raw = process.env[name];
  const normalized = raw?.trim().replace(/^['"]|['"]$/g, "");

  if (!normalized) {
    throw new Error(`Missing ${name} in Convex environment.`);
  }

  return normalized;
}

function assertLooksLikeStreamCredentials(apiKey: string, apiSecret: string) {
  const keyPreview =
    apiKey.length >= 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : apiKey;
  const secretPreview =
    apiSecret.length >= 8 ? `${apiSecret.slice(0, 4)}...${apiSecret.slice(-4)}` : apiSecret;

  // Stream API keys are short public identifiers.
  if (apiKey.length > 32) {
    throw new Error(
      `STREAM_API_KEY looks invalid (${keyPreview}). It may be the secret by mistake.`,
    );
  }

  // Stream secrets are longer server-only credentials.
  if (apiSecret.length < 16) {
    throw new Error(
      `STREAM_API_SECRET looks invalid (${secretPreview}). It may be the API key by mistake.`,
    );
  }
}

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

function getStreamCallBaseUrl(callType: string, callId: string) {
  return `https://video.stream-io-api.com/video/call/${encodeURIComponent(callType)}/${encodeURIComponent(callId)}`;
}

function getStreamRequestHeaders(token: string) {
  return {
    Authorization: token,
    "stream-auth-type": "jwt",
    "X-Stream-Client": "pensatori-meet-server",
    "Content-Type": "application/json",
  };
}

type StreamCallTranscription = {
  session_id: string;
  filename: string;
  url: string;
  start_time: string;
  end_time: string;
};

async function createOrUpdateStreamCall({
  apiKey,
  token,
  callType,
  callId,
  payload,
}: {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  payload: Record<string, unknown>;
}) {
  const url = new URL(getStreamCallBaseUrl(callType, callId));
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: getStreamRequestHeaders(token),
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: text,
  };
}

async function listStreamCallTranscriptions({
  apiKey,
  token,
  callType,
  callId,
}: {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
}): Promise<StreamCallTranscription[]> {
  const url = new URL(`${getStreamCallBaseUrl(callType, callId)}/transcriptions`);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    method: "GET",
    headers: getStreamRequestHeaders(token),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Stream transcription list failed (${response.status}). ${text || "No body."}`);
  }

  const parsed = text ? JSON.parse(text) : {};
  const transcriptions = Array.isArray(parsed?.transcriptions) ? parsed.transcriptions : [];
  return transcriptions as StreamCallTranscription[];
}

function truncateTranscriptContent(raw: string) {
  if (raw.length <= TRANSCRIPT_CONTENT_MAX_CHARS) {
    return raw;
  }

  const marker = "\n\n[Transcript truncated before saving to Convex]";
  const allowedLength = Math.max(0, TRANSCRIPT_CONTENT_MAX_CHARS - marker.length);
  return `${raw.slice(0, allowedLength)}${marker}`;
}

function extractTranscriptText(raw: string, filename: string, contentType?: string | null) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const lowerFilename = filename.toLowerCase();
  const isJson =
    contentType?.toLowerCase().includes("application/json") ||
    lowerFilename.endsWith(".json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (isJson) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        const chunks = parsed
          .map((entry) => {
            if (!entry || typeof entry !== "object") {
              return "";
            }
            const maybeText = (entry as { text?: unknown }).text;
            return typeof maybeText === "string" ? maybeText.trim() : "";
          })
          .filter(Boolean);
        if (chunks.length > 0) {
          return chunks.join("\n");
        }
      }

      if (parsed && typeof parsed === "object") {
        const objectText = (parsed as { text?: unknown }).text;
        if (typeof objectText === "string" && objectText.trim()) {
          return objectText.trim();
        }
      }
    } catch {
      // fall through to raw formatting.
    }
  }

  const isVtt =
    contentType?.toLowerCase().includes("text/vtt") ||
    lowerFilename.endsWith(".vtt") ||
    trimmed.startsWith("WEBVTT");

  if (isVtt) {
    const lines = trimmed.split(/\r?\n/);
    const textLines: string[] = [];

    for (const line of lines) {
      const value = line.trim();
      if (!value) {
        continue;
      }

      if (value === "WEBVTT") {
        continue;
      }

      if (/^\d+$/.test(value)) {
        continue;
      }

      if (value.includes("-->")) {
        continue;
      }

      textLines.push(value);
    }

    return textLines.join("\n");
  }

  return trimmed;
}

async function downloadTranscriptText(url: string, token: string, filename: string) {
  const directResponse = await fetch(url);
  if (directResponse.ok) {
    const rawText = await directResponse.text();
    return {
      text: truncateTranscriptContent(
        extractTranscriptText(rawText, filename, directResponse.headers.get("content-type")),
      ),
    };
  }

  const authenticatedResponse = await fetch(url, {
    headers: {
      Authorization: token,
      "stream-auth-type": "jwt",
      "X-Stream-Client": "pensatori-meet-server",
    },
  });

  if (authenticatedResponse.ok) {
    const rawText = await authenticatedResponse.text();
    return {
      text: truncateTranscriptContent(
        extractTranscriptText(rawText, filename, authenticatedResponse.headers.get("content-type")),
      ),
    };
  }

  throw new Error(`Could not download transcript file (${authenticatedResponse.status}).`);
}

async function markStreamCallEnded({
  apiKey,
  token,
  callType,
  callId,
}: {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
}) {
  const url = new URL(
    `${getStreamCallBaseUrl(callType, callId)}/mark_ended`,
  );
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: getStreamRequestHeaders(token),
    body: "{}",
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: text,
  };
}

async function ensureStreamTranscriptionConfigured({
  apiKey,
  token,
  callType,
  callId,
  startsAt,
}: {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  startsAt?: number;
}) {
  const payload: Record<string, unknown> = {
    data: {
      settings_override: {
        transcription: {
          mode: "auto-on",
          closed_caption_mode: "available",
          language: "auto",
        },
      },
    },
  };

  if (typeof startsAt === "number") {
    (payload.data as { starts_at?: string }).starts_at = new Date(startsAt).toISOString();
  }

  const result = await createOrUpdateStreamCall({
    apiKey,
    token,
    callType,
    callId,
    payload,
  });

  if (!result.ok) {
    throw new Error(
      `Could not configure Stream transcription (${result.status}). ${result.body || "No response body."}`,
    );
  }
}

async function syncTranscriptionsToConvex({
  ctx,
  apiKey,
  token,
  meetingId,
  callType,
  callId,
}: {
  ctx: ActionCtx;
  apiKey: string;
  token: string;
  meetingId: any;
  callType: string;
  callId: string;
}) {
  const transcriptions = await listStreamCallTranscriptions({
    apiKey,
    token,
    callType,
    callId,
  });

  let syncedCount = 0;
  const syncedAt = Date.now();

  for (const transcription of transcriptions) {
    const downloaded = await downloadTranscriptText(transcription.url, token, transcription.filename);
    if (!downloaded.text.trim()) {
      continue;
    }

    await ctx.runMutation(internalApi.meetings.upsertMeetingTranscript, {
      meetingId,
      streamCallSessionId: transcription.session_id,
      filename: transcription.filename,
      startTime: transcription.start_time,
      endTime: transcription.end_time,
      text: downloaded.text,
      syncedAt,
    });
    syncedCount += 1;
  }

  return {
    availableCount: transcriptions.length,
    syncedCount,
  };
}

function getMeetingChatChannelId(callId: string) {
  const clean = callId.trim().toLowerCase();
  return `meeting_${clean}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown error";
}

function isExpectedChatCreateError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("channel already exists") ||
    normalized.includes("already exists") ||
    normalized.includes("duplicate")
  );
}

function isExpectedMemberAlreadyInChannelError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already a member") ||
    normalized.includes("already exists") ||
    normalized.includes("contains duplicate")
  );
}

async function ensureChatChannelMembership({
  apiKey,
  apiSecret,
  callId,
  user,
}: {
  apiKey: string;
  apiSecret: string;
  callId: string;
  user: {
    id: string;
    name?: string;
    image?: string;
  };
}) {
  const chatClient = StreamChat.getInstance(apiKey, apiSecret);
  const channelId = getMeetingChatChannelId(callId);

  await chatClient.upsertUser({
    id: user.id,
    name: user.name ?? user.id,
    image: user.image,
  });

  const channel = chatClient.channel(CHAT_CHANNEL_TYPE, channelId, {
    created_by_id: user.id,
    members: [user.id],
  });

  try {
    await channel.create();
  } catch (error) {
    const message = getErrorMessage(error);
    if (!isExpectedChatCreateError(message)) {
      throw new Error(`Could not create Stream chat channel. ${message}`);
    }
  }

  try {
    await channel.addMembers([user.id]);
  } catch (error) {
    const message = getErrorMessage(error);
    if (!isExpectedMemberAlreadyInChannelError(message)) {
      throw new Error(`Could not add user to Stream chat channel. ${message}`);
    }
  }

  return {
    channelType: CHAT_CHANNEL_TYPE,
    channelId,
  };
}

export const issueStreamCredentials = action({
  args: {
    callId: v.string(),
    guestSessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const streamApiKey = readRequiredEnv("STREAM_API_KEY");
    const streamApiSecret = readRequiredEnv("STREAM_API_SECRET");
    assertLooksLikeStreamCredentials(streamApiKey, streamApiSecret);

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

      const userToken = createStreamUserToken(authJoin.streamUser.id, streamApiSecret);
      if (authJoin.meeting.transcriptionEnabled) {
        try {
          await ensureStreamTranscriptionConfigured({
            apiKey: streamApiKey,
            token: userToken,
            callType: authJoin.call.callType,
            callId: authJoin.call.callId,
            startsAt: authJoin.meeting.startsAt,
          });
        } catch (error) {
          console.error("Failed to configure Stream transcription for authenticated joiner", error);
        }
      }

      const chat = await ensureChatChannelMembership({
        apiKey: streamApiKey,
        apiSecret: streamApiSecret,
        callId: authJoin.call.callId,
        user: authJoin.streamUser,
      });

      return {
        apiKey: streamApiKey,
        token: userToken,
        callId: authJoin.call.callId,
        callType: authJoin.call.callType,
        user: authJoin.streamUser,
        meeting: authJoin.meeting,
        chat,
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

    const userToken = createStreamUserToken(guestJoin.streamUser.id, streamApiSecret);
    if (guestJoin.meeting.transcriptionEnabled) {
      try {
        await ensureStreamTranscriptionConfigured({
          apiKey: streamApiKey,
          token: userToken,
          callType: guestJoin.call.callType,
          callId: guestJoin.call.callId,
          startsAt: guestJoin.meeting.startsAt,
        });
      } catch (error) {
        console.error("Failed to configure Stream transcription for guest joiner", error);
      }
    }

    const chat = await ensureChatChannelMembership({
      apiKey: streamApiKey,
      apiSecret: streamApiSecret,
      callId: guestJoin.call.callId,
      user: guestJoin.streamUser,
    });

    return {
      apiKey: streamApiKey,
      token: userToken,
      callId: guestJoin.call.callId,
      callType: guestJoin.call.callType,
      user: guestJoin.streamUser,
      meeting: guestJoin.meeting,
      chat,
    };
  },
});

export const endMeetingForAll = action({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to perform this action.");
    }

    const streamApiKey = readRequiredEnv("STREAM_API_KEY");
    const streamApiSecret = readRequiredEnv("STREAM_API_SECRET");
    assertLooksLikeStreamCredentials(streamApiKey, streamApiSecret);

    const meeting = await ctx.runQuery(internalApi.meetings.getMeetingForEnding, {
      meetingId: args.meetingId,
      clerkId: identity.subject,
    });

    if (meeting.endedAt) {
      let transcriptSync:
        | {
            availableCount: number;
            syncedCount: number;
          }
        | undefined;

      if (meeting.transcriptionEnabled) {
        try {
          const hostToken = createStreamUserToken(`clerk_${identity.subject}`, streamApiSecret);
          transcriptSync = await syncTranscriptionsToConvex({
            ctx,
            apiKey: streamApiKey,
            token: hostToken,
            meetingId: meeting.meetingId,
            callType: meeting.callType,
            callId: meeting.callId,
          });
        } catch (error) {
          console.error("Failed to sync transcripts for ended meeting", error);
        }
      }

      return {
        meetingId: meeting.meetingId,
        callId: meeting.callId,
        endedAt: meeting.endedAt,
        streamStatus: "already_ended",
        transcriptSync,
      };
    }

    const hostToken = createStreamUserToken(`clerk_${identity.subject}`, streamApiSecret);

    const streamResult = await markStreamCallEnded({
      apiKey: streamApiKey,
      token: hostToken,
      callType: meeting.callType,
      callId: meeting.callId,
    });

    const streamBody = streamResult.body.toLowerCase();
    const streamNotFound = streamResult.status === 404;
    const streamAlreadyEnded =
      streamResult.status === 409 ||
      streamBody.includes("already ended") ||
      streamBody.includes("call ended");

    if (!streamResult.ok && !streamNotFound && !streamAlreadyEnded) {
      throw new Error(
        `Stream failed to end this call (${streamResult.status}). ${streamResult.body || "No response body."}`,
      );
    }

    const endedAt = Date.now();
    const finalized = await ctx.runMutation(internalApi.meetings.finalizeEndedMeeting, {
      meetingId: meeting.meetingId,
      clerkId: identity.subject,
      endedAt,
    });

    let transcriptSync:
      | {
          availableCount: number;
          syncedCount: number;
        }
      | undefined;
    if (meeting.transcriptionEnabled) {
      try {
        transcriptSync = await syncTranscriptionsToConvex({
          ctx,
          apiKey: streamApiKey,
          token: hostToken,
          meetingId: meeting.meetingId,
          callType: meeting.callType,
          callId: meeting.callId,
        });
      } catch (error) {
        console.error("Failed to sync transcripts after ending meeting", error);
      }
    }

    return {
      ...finalized,
      streamStatus: streamResult.ok ? "ended" : streamNotFound ? "not_found" : "already_ended",
      transcriptSync,
    };
  },
});

export const syncMeetingTranscripts = action({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to perform this action.");
    }

    const streamApiKey = readRequiredEnv("STREAM_API_KEY");
    const streamApiSecret = readRequiredEnv("STREAM_API_SECRET");
    assertLooksLikeStreamCredentials(streamApiKey, streamApiSecret);

    const meeting = await ctx.runQuery(internalApi.meetings.getMeetingForEnding, {
      meetingId: args.meetingId,
      clerkId: identity.subject,
    });

    if (!meeting.transcriptionEnabled) {
      return {
        meetingId: meeting.meetingId,
        callId: meeting.callId,
        availableCount: 0,
        syncedCount: 0,
        skipped: true,
      };
    }

    const hostToken = createStreamUserToken(`clerk_${identity.subject}`, streamApiSecret);
    const synced = await syncTranscriptionsToConvex({
      ctx,
      apiKey: streamApiKey,
      token: hostToken,
      meetingId: meeting.meetingId,
      callType: meeting.callType,
      callId: meeting.callId,
    });

    return {
      meetingId: meeting.meetingId,
      callId: meeting.callId,
      ...synced,
      skipped: false,
    };
  },
});
