"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StreamCall, StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import type { Channel } from "stream-chat";
import { StreamChat } from "stream-chat";
import { useAction, useQuery } from "convex/react";

import { ConnectedCallRoom } from "@/components/call/connected-call-room";
import { formatDate } from "@/components/call/utils";
import { api } from "@/lib/convex-api";
import { Button } from "@workspace/ui/components/button";

type ConnectedState = {
  videoClient: StreamVideoClient;
  call: ReturnType<StreamVideoClient["call"]>;
  chatClient: StreamChat;
  chatChannel: Channel;
  meeting: {
    title: string;
    kind: "instant" | "scheduled";
    startsAt?: number;
    transcriptionEnabled?: boolean;
  };
  userId: string;
  userLabel: string;
  userImage?: string;
};

async function disconnectRoom(state: ConnectedState) {
  try {
    await state.call.leave();
  } catch {
    // no-op
  }

  try {
    await state.videoClient.disconnectUser();
  } catch {
    // no-op
  }

  try {
    await state.chatChannel.stopWatching();
  } catch {
    // no-op
  }

  try {
    await state.chatClient.disconnectUser();
  } catch {
    // no-op
  }
}

export function MeetingRoom({
  callId,
  guestSessionToken,
}: {
  callId: string;
  guestSessionToken?: string;
}) {
  const issueStreamCredentials = useAction(api.stream.issueStreamCredentials);
  const startMeetingTranscription = useAction(api.stream.startMeetingTranscription);
  const roomStatus = useQuery(api.meetings.getRoomStatus, {
    callId,
    guestSessionToken,
  });

  const [connectedState, setConnectedState] = useState<ConnectedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [joinState, setJoinState] = useState<"preview" | "joining" | "in-call">("preview");
  const [leftCall, setLeftCall] = useState(false);
  const [endedAt, setEndedAt] = useState<number | null>(null);

  useEffect(() => {
    if (roomStatus?.endedAt) {
      setEndedAt(roomStatus.endedAt);
    }
  }, [roomStatus?.endedAt]);

  useEffect(() => {
    let cancelled = false;
    let activeState: ConnectedState | null = null;

    const connect = async () => {
      if (leftCall || endedAt) {
        setIsConnecting(false);
        return;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const credentials = await issueStreamCredentials({
          callId,
          guestSessionToken,
        });

        if (!credentials.apiKey || /\s/.test(credentials.apiKey)) {
          throw new Error(
            "Invalid Stream API key returned by backend. Check STREAM_API_KEY in Convex env.",
          );
        }

        if (cancelled) {
          return;
        }

        const client = new StreamVideoClient({
          apiKey: credentials.apiKey,
          token: credentials.token,
          user: credentials.user,
        });

        const call = client.call(credentials.callType, credentials.callId);
        if (!credentials.chat?.channelType || !credentials.chat?.channelId) {
          throw new Error("Chat channel details were not returned by the backend.");
        }

        const chatClient = StreamChat.getInstance(credentials.apiKey);
        if (chatClient.userID && chatClient.userID !== credentials.user.id) {
          await chatClient.disconnectUser();
        }

        if (!chatClient.userID) {
          await chatClient.connectUser(credentials.user, credentials.token);
        }

        const chatChannel = chatClient.channel(
          credentials.chat.channelType,
          credentials.chat.channelId,
        );
        await chatChannel.watch();

        const nextState: ConnectedState = {
          videoClient: client,
          call,
          chatClient,
          chatChannel,
          meeting: credentials.meeting,
          userId: credentials.user.id,
          userLabel: credentials.user.name ?? credentials.user.id,
          userImage: credentials.user.image,
        };

        if (cancelled) {
          await disconnectRoom(nextState);
          return;
        }

        activeState = nextState;
        setConnectedState(nextState);
        setJoinState("preview");
      } catch (connectionError) {
        const message =
          connectionError instanceof Error
            ? connectionError.message
            : "Could not connect to this meeting.";

        const normalizedMessage = message.toLowerCase();
        if (
          normalizedMessage.includes("initial ws connection could not be established") ||
          normalizedMessage.includes("accesskeyerror")
        ) {
          setError(
            "Stream rejected the connection. Verify STREAM_API_KEY and STREAM_API_SECRET in Convex belong to the same Stream app/deployment.",
          );
        } else {
          setError(message);
        }

        setConnectedState(null);
      } finally {
        if (!cancelled) {
          setIsConnecting(false);
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
      if (!activeState) {
        return;
      }

      void disconnectRoom(activeState);
    };
  }, [callId, endedAt, guestSessionToken, issueStreamCredentials, leftCall]);

  useEffect(() => {
    if (!connectedState || !roomStatus?.endedAt) {
      return;
    }

    const shutdown = async () => {
      await disconnectRoom(connectedState);
      setConnectedState(null);
      setEndedAt(roomStatus.endedAt ?? Date.now());
    };

    void shutdown();
  }, [connectedState, roomStatus?.endedAt]);

  const onJoinCall = useCallback(async () => {
    if (!connectedState) {
      return;
    }

    setError(null);
    setJoinState("joining");

    try {
      await connectedState.call.join({ create: true });

      if (
        connectedState.meeting.transcriptionEnabled &&
        connectedState.userId.startsWith("clerk_")
      ) {
        try {
          await startMeetingTranscription({ callId });
        } catch (transcriptionError) {
          const message =
            transcriptionError instanceof Error
              ? transcriptionError.message
              : "Could not start transcription for this call.";

          if (!message.toLowerCase().includes("only meeting hosts can start transcription")) {
            console.error("Joined call, but transcription did not start:", message);
          }
        }
      }

      setJoinState("in-call");
    } catch (joinError) {
      setJoinState("preview");
      setError(joinError instanceof Error ? joinError.message : "Could not join this meeting.");
    }
  }, [callId, connectedState, startMeetingTranscription]);

  const onCancelOrLeave = useCallback(async () => {
    if (connectedState) {
      await disconnectRoom(connectedState);
      setConnectedState(null);
    }

    setLeftCall(true);
  }, [connectedState]);

  if (isConnecting) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07090c] px-4 text-white">
        <div className="w-full max-w-lg border border-white/15 bg-white/5 p-6 text-sm text-white/80">
          Connecting to meeting room...
        </div>
      </main>
    );
  }

  if (endedAt) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07090c] px-4 text-white">
        <div className="w-full max-w-xl border border-white/15 bg-white/5 p-7">
          <h1 className="text-2xl font-semibold">This call has ended</h1>
          <p className="mt-2 text-sm text-white/70">
            Ended by host{endedAt ? ` on ${formatDate(endedAt)}` : ""}.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (leftCall) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07090c] px-4 text-white">
        <div className="w-full max-w-xl border border-white/15 bg-white/5 p-7">
          <h1 className="text-2xl font-semibold">You left the call</h1>
          <p className="mt-2 text-sm text-white/70">You can rejoin from the dashboard anytime.</p>
          <Button asChild className="mt-5">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (error || !connectedState) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07090c] px-4 text-white">
        <div className="w-full max-w-lg border border-white/15 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">Could not join room</h1>
          <p className="mt-2 text-sm text-white/75">{error ?? "Unknown error"}</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <StreamVideo client={connectedState.videoClient}>
      <StreamCall call={connectedState.call}>
        <ConnectedCallRoom
          meetingTitle={roomStatus?.title ?? connectedState.meeting.title}
          userId={connectedState.userId}
          userLabel={connectedState.userLabel}
          userImage={connectedState.userImage}
          chatChannel={connectedState.chatChannel}
          joinState={joinState}
          onJoin={onJoinCall}
          onCancel={onCancelOrLeave}
          onLeave={onCancelOrLeave}
        />
      </StreamCall>
    </StreamVideo>
  );
}
