"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

function formatDate(ts?: number) {
  if (!ts) {
    return "Starts instantly";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function GuestJoinForm({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const invite = useQuery(api.meetings.getInviteLanding, { inviteCode });
  const createGuestSession = useMutation(api.meetings.createGuestSessionFromInvite);
  const acceptInviteAsAuthenticated = useMutation(api.meetings.acceptInviteAsAuthenticated);

  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const joinAsGuest = () => {
    startTransition(async () => {
      setError(null);

      if (!guestName.trim()) {
        setError("Enter your name to join as guest.");
        return;
      }

      try {
        const result = await createGuestSession({
          inviteCode,
          guestName: guestName.trim(),
        });

        router.push(`/room/${result.callId}?gs=${encodeURIComponent(result.guestSessionToken)}`);
      } catch (joinError) {
        setError(joinError instanceof Error ? joinError.message : "Could not join as guest.");
      }
    });
  };

  const joinAsSignedInUser = () => {
    startTransition(async () => {
      setError(null);

      try {
        const result = await acceptInviteAsAuthenticated({ inviteCode });
        router.push(`/room/${result.callId}`);
      } catch (joinError) {
        setError(joinError instanceof Error ? joinError.message : "Could not accept invite.");
      }
    });
  };

  if (invite === undefined) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/80 p-6 text-sm text-black/70">
          Loading invite...
        </div>
      </main>
    );
  }

  if (invite === null) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/85 p-6">
          <h1 className="text-2xl font-semibold text-black">Invite not available</h1>
          <p className="mt-2 text-sm text-black/70">
            This invite may be expired, revoked, or already fully used.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Go to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white/85 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-black/55">Pensatori Meet Invite</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">{invite.meetingTitle}</h1>
        <p className="mt-2 text-sm text-black/70">
          {invite.meetingKind === "scheduled" ? "Scheduled" : "Instant"} • {formatDate(invite.startsAt)}
        </p>

        {invite.inviteDisplayName ? (
          <p className="mt-1 text-sm text-black/60">Invite: {invite.inviteDisplayName}</p>
        ) : null}

        <div className="mt-6 grid gap-3 rounded-xl border border-black/10 bg-[#f8f7f2] p-4">
          <Input
            placeholder="Your name"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
          />
          <Button disabled={isPending} onClick={joinAsGuest}>
            Join as guest
          </Button>
          {isSignedIn ? (
            <Button variant="outline" disabled={isPending} onClick={joinAsSignedInUser}>
              Join with my Clerk account
            </Button>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
