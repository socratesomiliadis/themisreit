"use node";

import { createHmac } from "crypto";
import { v } from "convex/values";
import { StreamChat } from "stream-chat";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const internalApi = internal as any;
const CHAT_CHANNEL_TYPE = "messaging";

type StreamCallTranscription = {
  session_id: string;
  filename: string;
  url: string;
  start_time: string;
  end_time: string;
};

type TranscriptUtterance = {
  id: string;
  speaker: string;
  text: string;
  startMs: number | null;
  endMs: number | null;
};

function readRequiredEnv(name: "STREAM_API_KEY" | "STREAM_API_SECRET") {
  const raw = process.env[name];
  const normalized = raw?.trim().replace(/^['"]|['"]$/g, "");

  if (!normalized) {
    throw new Error(`Missing ${name} in Convex environment.`);
  }

  return normalized;
}

function readOptionalEnv(name: string) {
  const raw = process.env[name];
  const normalized = raw?.trim().replace(/^['"]|['"]$/g, "");
  return normalized || undefined;
}

function assertLooksLikeStreamCredentials(apiKey: string, apiSecret: string) {
  const keyPreview =
    apiKey.length >= 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : apiKey;
  const secretPreview =
    apiSecret.length >= 8
      ? `${apiSecret.slice(0, 4)}...${apiSecret.slice(-4)}`
      : apiSecret;

  // Stream API keys are short public identifiers.
  if (apiKey.length > 32) {
    throw new Error(
      `STREAM_API_KEY looks invalid (${keyPreview}). It may be the secret by mistake.`
    );
  }

  // Stream secrets are longer server-only credentials.
  if (apiSecret.length < 16) {
    throw new Error(
      `STREAM_API_SECRET looks invalid (${secretPreview}). It may be the API key by mistake.`
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
  const signature = createHmac("sha256", secret)
    .update(unsigned)
    .digest("base64url");

  return `${unsigned}.${signature}`;
}

function getStreamCallBaseUrl(callType: string, callId: string) {
  return `https://video.stream-io-api.com/video/call/${encodeURIComponent(callType)}/${encodeURIComponent(callId)}`;
}

function getStreamAuthHeaders(token: string) {
  return {
    Authorization: token,
    "stream-auth-type": "jwt",
    "X-Stream-Client": "pensatori-meet-server",
  };
}

function getStreamJsonRequestHeaders(token: string) {
  return {
    ...getStreamAuthHeaders(token),
    "Content-Type": "application/json",
  };
}

async function getOrCreateStreamCall({
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
    headers: getStreamJsonRequestHeaders(token),
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: text,
  };
}

async function patchStreamCall({
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
    method: "PATCH",
    headers: getStreamJsonRequestHeaders(token),
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
  const url = new URL(
    `${getStreamCallBaseUrl(callType, callId)}/transcriptions`
  );
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    method: "GET",
    headers: getStreamAuthHeaders(token),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Stream transcription list failed (${response.status}). ${text || "No body."}`
    );
  }

  const parsed = text ? JSON.parse(text) : {};
  const transcriptions = Array.isArray(parsed?.transcriptions)
    ? parsed.transcriptions
    : [];
  return transcriptions as StreamCallTranscription[];
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
  const url = new URL(`${getStreamCallBaseUrl(callType, callId)}/mark_ended`);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: getStreamJsonRequestHeaders(token),
    body: "{}",
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: text,
  };
}

async function startStreamCallTranscription({
  apiKey,
  token,
  callType,
  callId,
  transcriptionExternalStorage,
}: {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  transcriptionExternalStorage?: string;
}) {
  const url = new URL(
    `${getStreamCallBaseUrl(callType, callId)}/start_transcription`
  );
  url.searchParams.set("api_key", apiKey);

  const body: Record<string, unknown> = {
    enable_closed_captions: true,
    language: "en",
  };
  if (transcriptionExternalStorage) {
    body.transcription_external_storage = transcriptionExternalStorage;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: getStreamJsonRequestHeaders(token),
    body: JSON.stringify(body),
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
  const getOrCreatePayload: Record<string, unknown> = {
    data: {
      settings_override: {
        transcription: {
          mode: "auto-on",
          closed_caption_mode: "available",
          language: "en",
        },
      },
    },
  };

  if (typeof startsAt === "number") {
    (getOrCreatePayload.data as { starts_at?: string }).starts_at = new Date(
      startsAt
    ).toISOString();
  }

  const getOrCreateResult = await getOrCreateStreamCall({
    apiKey,
    token,
    callType,
    callId,
    payload: getOrCreatePayload,
  });

  if (!getOrCreateResult.ok) {
    throw new Error(
      `Could not configure Stream transcription (${getOrCreateResult.status}). ${getOrCreateResult.body || "No response body."}`
    );
  }

  const patchPayload: Record<string, unknown> = {
    settings_override: {
      transcription: {
        mode: "auto-on",
        closed_caption_mode: "available",
        language: "en",
      },
    },
  };

  if (typeof startsAt === "number") {
    patchPayload.starts_at = new Date(startsAt).toISOString();
  }

  const patchResult = await patchStreamCall({
    apiKey,
    token,
    callType,
    callId,
    payload: patchPayload,
  });

  if (!patchResult.ok) {
    throw new Error(
      `Could not patch Stream transcription settings (${patchResult.status}). ${patchResult.body || "No response body."}`
    );
  }
}

function parseTimeValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const parsedDate = Date.parse(trimmed);
    if (Number.isFinite(parsedDate)) {
      return parsedDate;
    }
  }

  return null;
}

function pickFirstNonEmptyString(values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseTranscriptWords(words: unknown): string {
  if (!Array.isArray(words)) {
    return "";
  }

  return words
    .map((word) => {
      if (!word || typeof word !== "object") {
        return "";
      }

      const typed = word as Record<string, unknown>;
      const text = pickFirstNonEmptyString([
        typed.word,
        typed.text,
        typed.token,
      ]);
      return text;
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

function parseTranscriptJsonl(raw: string): TranscriptUtterance[] {
  const parsed: TranscriptUtterance[] = [];
  const lines = raw.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line?.trim();
    if (!trimmed) {
      continue;
    }

    let record: unknown;
    try {
      record = JSON.parse(trimmed);
    } catch {
      continue;
    }

    const typed = asRecord(record);
    if (!typed) {
      continue;
    }

    const candidates = [typed];
    const nestedKeys = [
      "event",
      "payload",
      "data",
      "transcription",
      "utterance",
    ];
    for (const key of nestedKeys) {
      const nested = asRecord(typed[key]);
      if (nested) {
        candidates.push(nested);
      }
    }

    let matched: TranscriptUtterance | null = null;
    for (const candidate of candidates) {
      const text = pickFirstNonEmptyString([
        candidate.text,
        candidate.transcript,
        candidate.content,
        parseTranscriptWords(candidate.words),
      ]);
      if (!text) {
        continue;
      }

      const speaker = pickFirstNonEmptyString([
        candidate.speaker_id,
        candidate.speaker,
        candidate.user_id,
        candidate.participant_id,
        candidate.person_id,
        candidate.name,
      ]);

      matched = {
        id:
          pickFirstNonEmptyString([candidate.id, typed.id]) ||
          `line_${index + 1}`,
        speaker: speaker || "Unknown speaker",
        text,
        startMs: parseTimeValue(
          candidate.start_time ??
            candidate.stop_time ??
            candidate.start ??
            candidate.start_ms ??
            candidate.timestamp_ms ??
            typed.start_time ??
            typed.stop_time ??
            typed.start ??
            typed.start_ms
        ),
        endMs: parseTimeValue(
          candidate.stop_time ??
            candidate.end_time ??
            candidate.end ??
            candidate.end_ms ??
            typed.stop_time ??
            typed.end_time ??
            typed.end
        ),
      };
      break;
    }

    if (matched) {
      parsed.push(matched);
    }
  }

  return parsed;
}

function sortTranscriptionsByNewest(items: StreamCallTranscription[]) {
  items.sort((a, b) => {
    const aTime = Date.parse(a.end_time || a.start_time || "");
    const bTime = Date.parse(b.end_time || b.start_time || "");
    return (
      (Number.isFinite(bTime) ? bTime : 0) -
      (Number.isFinite(aTime) ? aTime : 0)
    );
  });
}

async function fetchStreamTranscriptText({
  transcriptUrl,
  token,
}: {
  transcriptUrl: string;
  token: string;
}) {
  // Stream docs: transcription list URLs are signed; fetch them directly.
  const signedUrlResponse = await fetch(transcriptUrl, { method: "GET" });
  if (signedUrlResponse.ok) {
    return signedUrlResponse.text();
  }

  // Fallback for non-signed/internal storage paths.
  const authorizedResponse = await fetch(transcriptUrl, {
    method: "GET",
    headers: getStreamAuthHeaders(token),
  });
  if (authorizedResponse.ok) {
    return authorizedResponse.text();
  }

  const signedBody = await signedUrlResponse.text();
  const authorizedBody = await authorizedResponse.text();
  throw new Error(
    `Could not fetch transcript file (${signedUrlResponse.status}/${authorizedResponse.status}). ${
      signedBody || authorizedBody || "No response body."
    }`
  );
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
      const authJoin = await ctx.runQuery(
        internalApi.meetings.resolveAuthenticatedJoiner,
        {
          callId: args.callId,
          clerkId: identity.subject,
        }
      );

      if (!authJoin) {
        throw new Error("You are not allowed to join this meeting.");
      }

      await ctx.runMutation(
        internalApi.meetings.touchAuthenticatedParticipant,
        {
          meetingId: authJoin.meetingId,
          clerkId: identity.subject,
        }
      );

      const userToken = createStreamUserToken(
        authJoin.streamUser.id,
        streamApiSecret
      );
      if (
        authJoin.meeting.transcriptionEnabled &&
        authJoin.canManageCallSettings
      ) {
        await ensureStreamTranscriptionConfigured({
          apiKey: streamApiKey,
          token: userToken,
          callType: authJoin.call.callType,
          callId: authJoin.call.callId,
          startsAt: authJoin.meeting.startsAt,
        });
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

    const guestJoin = await ctx.runQuery(
      internalApi.meetings.resolveGuestJoiner,
      {
        callId: args.callId,
        guestSessionToken: args.guestSessionToken,
      }
    );

    if (!guestJoin) {
      throw new Error("Guest session is invalid for this meeting.");
    }

    await ctx.runMutation(internalApi.meetings.touchGuestSession, {
      meetingId: guestJoin.meetingId,
      sessionId: guestJoin.sessionId,
    });

    const userToken = createStreamUserToken(
      guestJoin.streamUser.id,
      streamApiSecret
    );
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

    const meeting = await ctx.runQuery(
      internalApi.meetings.getMeetingForEnding,
      {
        meetingId: args.meetingId,
        clerkId: identity.subject,
      }
    );

    if (meeting.endedAt) {
      return {
        meetingId: meeting.meetingId,
        callId: meeting.callId,
        endedAt: meeting.endedAt,
        streamStatus: "already_ended",
      };
    }

    const hostToken = createStreamUserToken(
      `clerk_${identity.subject}`,
      streamApiSecret
    );

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
        `Stream failed to end this call (${streamResult.status}). ${streamResult.body || "No response body."}`
      );
    }

    const endedAt = Date.now();
    const finalized = await ctx.runMutation(
      internalApi.meetings.finalizeEndedMeeting,
      {
        meetingId: meeting.meetingId,
        clerkId: identity.subject,
        endedAt,
      }
    );

    return {
      ...finalized,
      streamStatus: streamResult.ok
        ? "ended"
        : streamNotFound
          ? "not_found"
          : "already_ended",
    };
  },
});

export const openMeetingTranscriptFile = action({
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

    const meeting = await ctx.runQuery(
      internalApi.meetings.getMeetingForTranscriptAccess,
      {
        meetingId: args.meetingId,
        clerkId: identity.subject,
      }
    );

    if (!meeting) {
      throw new Error(
        "You do not have permission to access this meeting transcript."
      );
    }

    if (!meeting.transcriptionEnabled) {
      throw new Error("Transcription is disabled for this meeting.");
    }

    const token = createStreamUserToken(
      `clerk_${identity.subject}`,
      streamApiSecret
    );
    const transcriptions = await listStreamCallTranscriptions({
      apiKey: streamApiKey,
      token,
      callType: meeting.callType,
      callId: meeting.callId,
    });

    if (transcriptions.length === 0) {
      throw new Error(
        "No transcript file is available yet. Try again in a minute."
      );
    }

    sortTranscriptionsByNewest(transcriptions);

    const latest = transcriptions[0];
    if (!latest) {
      throw new Error(
        "No transcript file is available yet. Try again in a minute."
      );
    }

    const transcriptRaw = await fetchStreamTranscriptText({
      transcriptUrl: latest.url,
      token,
    });
    const utterances = parseTranscriptJsonl(transcriptRaw);
    if (utterances.length === 0) {
      throw new Error(
        "Transcript file was found but no readable transcript lines were detected."
      );
    }

    return {
      meetingId: meeting.meetingId,
      callId: meeting.callId,
      filename: latest.filename,
      availableCount: transcriptions.length,
      startTime: latest.start_time,
      endTime: latest.end_time,
      utterances,
    };
  },
});

export const startMeetingTranscription = action({
  args: {
    callId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to perform this action.");
    }

    const streamApiKey = readRequiredEnv("STREAM_API_KEY");
    const streamApiSecret = readRequiredEnv("STREAM_API_SECRET");
    assertLooksLikeStreamCredentials(streamApiKey, streamApiSecret);

    const authJoin = await ctx.runQuery(
      internalApi.meetings.resolveAuthenticatedJoiner,
      {
        callId: args.callId,
        clerkId: identity.subject,
      }
    );

    if (!authJoin) {
      throw new Error("You are not allowed to join this meeting.");
    }

    if (!authJoin.canManageCallSettings) {
      throw new Error("Only meeting hosts can start transcription.");
    }

    if (!authJoin.meeting.transcriptionEnabled) {
      return { skipped: true, reason: "disabled" as const };
    }

    const hostToken = createStreamUserToken(
      `clerk_${identity.subject}`,
      streamApiSecret
    );
    await ensureStreamTranscriptionConfigured({
      apiKey: streamApiKey,
      token: hostToken,
      callType: authJoin.call.callType,
      callId: authJoin.call.callId,
      startsAt: authJoin.meeting.startsAt,
    });

    const transcriptionExternalStorage = readOptionalEnv(
      "STREAM_TRANSCRIPTION_STORAGE_NAME"
    );
    const startResult = await startStreamCallTranscription({
      apiKey: streamApiKey,
      token: hostToken,
      callType: authJoin.call.callType,
      callId: authJoin.call.callId,
      transcriptionExternalStorage,
    });

    if (!startResult.ok) {
      const normalizedBody = startResult.body.toLowerCase();
      const alreadyStarted =
        startResult.status === 409 ||
        normalizedBody.includes("already started") ||
        normalizedBody.includes("already running");

      if (!alreadyStarted) {
        throw new Error(
          `Stream failed to start transcription (${startResult.status}). ${startResult.body || "No response body."}`
        );
      }

      return {
        skipped: true,
        reason: "already_started" as const,
      };
    }

    return {
      skipped: false,
      reason: "started" as const,
      storage: transcriptionExternalStorage ?? "default",
    };
  },
});
