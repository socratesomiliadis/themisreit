"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useAction } from "convex/react";

import { api } from "@/lib/convex-api";
import { Button } from "@workspace/ui/components/button";

type ConnectedState = {
  client: StreamVideoClient;
  call: ReturnType<StreamVideoClient["call"]>;
  meeting: {
    title: string;
    kind: "instant" | "scheduled";
    startsAt?: number;
  };
  userLabel: string;
};

function RoomState() {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <div className="grid h-[65vh] place-items-center text-sm text-black/65">Joining call...</div>;
  }

  return (
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="flex-1 overflow-hidden p-3">
        <SpeakerLayout />
      </div>
      <div className="border-t border-black/10 bg-white/80 p-3">
        <CallControls />
      </div>
    </div>
  );
}

export function MeetingRoom({
  callId,
  guestSessionToken,
}: {
  callId: string;
  guestSessionToken?: string;
}) {
  const issueStreamCredentials = useAction(api.stream.issueStreamCredentials);
  const [connectedState, setConnectedState] = useState<ConnectedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let activeClient: StreamVideoClient | null = null;
    let activeCall: ReturnType<StreamVideoClient["call"]> | null = null;

    const connect = async () => {
      setIsConnecting(true);
      setError(null);
      setConnectedState(null);

      try {
        const credentials = await issueStreamCredentials({
          callId,
          guestSessionToken,
        });

        if (cancelled) {
          return;
        }

        const client = new StreamVideoClient({
          apiKey: credentials.apiKey,
          token: credentials.token,
          user: credentials.user,
        });

        const call = client.call(credentials.callType, credentials.callId);
        await call.join({ create: true });

        if (cancelled) {
          await call.leave();
          await client.disconnectUser();
          return;
        }

        activeClient = client;
        activeCall = call;

        setConnectedState({
          client,
          call,
          meeting: credentials.meeting,
          userLabel: credentials.user.name ?? credentials.user.id,
        });
      } catch (connectionError) {
        setError(
          connectionError instanceof Error
            ? connectionError.message
            : "Could not connect to this meeting.",
        );
      } finally {
        if (!cancelled) {
          setIsConnecting(false);
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;

      const cleanup = async () => {
        if (activeCall) {
          try {
            await activeCall.leave();
          } catch {
            // no-op
          }
        }

        if (activeClient) {
          try {
            await activeClient.disconnectUser();
          } catch {
            // no-op
          }
        }
      };

      void cleanup();
    };
  }, [callId, guestSessionToken, issueStreamCredentials]);

  if (isConnecting) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white/85 p-6 text-sm text-black/70">
          Connecting to meeting room...
        </div>
      </main>
    );
  }

  if (error || !connectedState) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white/90 p-6">
          <h1 className="text-xl font-semibold text-black">Could not join room</h1>
          <p className="mt-2 text-sm text-black/70">{error ?? "Unknown error"}</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="rounded-2xl border border-black/10 bg-white/80 p-4 md:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/55">Live room</p>
          <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {connectedState.meeting.title}
            </h1>
            <p className="text-sm text-black/65">You are joined as {connectedState.userLabel}</p>
          </div>
        </header>

        <StreamVideo client={connectedState.client}>
          <StreamCall call={connectedState.call}>
            <StreamTheme className="stream-theme">
              <RoomState />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </div>
    </main>
  );
}
