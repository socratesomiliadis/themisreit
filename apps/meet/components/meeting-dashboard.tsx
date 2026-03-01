"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { UserButton } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import type { Id } from "@convex/_generated/dataModel";

import { api } from "@/lib/convex-api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

function formatDate(ts?: number) {
  if (!ts) {
    return "Starts immediately";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

function MeetingTranscriptsSection({ meetingId }: { meetingId: Id<"meetings"> }) {
  const transcripts = useQuery(api.meetings.listMeetingTranscripts, { meetingId });

  if (transcripts === undefined) {
    return (
      <div className="mt-3 rounded-xl border border-black/10 bg-white/70 p-3 text-sm text-black/60">
        Loading transcripts...
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-black/10 bg-white/70 p-3 text-sm text-black/60">
        No transcript text synced yet.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {transcripts.map((transcript) => (
        <article key={transcript._id} className="rounded-xl border border-black/10 bg-white p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-black/50">
            {formatDate(new Date(transcript.startTime).getTime())} -{" "}
            {formatDate(new Date(transcript.endTime).getTime())}
          </p>
          <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs text-black/80">
            {transcript.text}
          </pre>
        </article>
      ))}
    </div>
  );
}

export function MeetingDashboard() {
  const meetingsQuery = useQuery(api.meetings.listForViewer);
  const meetings = useMemo(() => meetingsQuery ?? [], [meetingsQuery]);
  const createInstantMeeting = useMutation(api.meetings.createInstantMeeting);
  const scheduleMeeting = useMutation(api.meetings.scheduleMeeting);
  const createInvite = useMutation(api.meetings.createInvite);
  const revokeInvite = useMutation(api.meetings.revokeInvite);
  const endMeeting = useAction(api.stream.endMeetingForAll);
  const syncMeetingTranscripts = useAction(api.stream.syncMeetingTranscripts);

  const [instantTitle, setInstantTitle] = useState("");
  const [instantTranscriptionEnabled, setInstantTranscriptionEnabled] = useState(false);
  const [scheduledTitle, setScheduledTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduledTranscriptionEnabled, setScheduledTranscriptionEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [inviteEmailByMeeting, setInviteEmailByMeeting] = useState<
    Record<string, string>
  >({});
  const [inviteNameByMeeting, setInviteNameByMeeting] = useState<
    Record<string, string>
  >({});
  const [nowMs, setNowMs] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const refreshNow = () => setNowMs(Date.now());
    refreshNow();
    const timer = window.setInterval(refreshNow, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const nextMeeting = useMemo(() => {
    return meetings.find(
      (meeting) => !meeting.endedAt && (meeting.startsAt ?? nowMs) >= nowMs,
    );
  }, [meetings, nowMs]);

  const copyInvite = async (inviteCode: string) => {
    const invitePath = `/join/${inviteCode}`;
    const fullInvite =
      typeof window === "undefined"
        ? invitePath
        : new URL(invitePath, window.location.origin).toString();

    await navigator.clipboard.writeText(fullInvite);
    setStatus(`Copied invite link: ${fullInvite}`);
  };

  const onCreateInstantMeeting = () => {
    startTransition(async () => {
      setStatus(null);
      try {
        const result = await createInstantMeeting({
          title: instantTitle.trim() || undefined,
          transcriptionEnabled: instantTranscriptionEnabled,
        });

        setInstantTitle("");
        setInstantTranscriptionEnabled(false);
        setStatus(`Instant meeting ready: /room/${result.callId}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not create meeting.");
      }
    });
  };

  const onScheduleMeeting = () => {
    startTransition(async () => {
      setStatus(null);

      const parsedDate = new Date(scheduledFor);
      const startsAt = parsedDate.getTime();

      if (!scheduledFor || Number.isNaN(startsAt)) {
        setStatus("Pick a valid date and time.");
        return;
      }

      try {
        const result = await scheduleMeeting({
          title: scheduledTitle.trim() || undefined,
          startsAt,
          transcriptionEnabled: scheduledTranscriptionEnabled,
        });

        setScheduledTitle("");
        setScheduledFor("");
        setScheduledTranscriptionEnabled(false);
        setStatus(`Scheduled meeting created: /room/${result.callId}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not schedule meeting.");
      }
    });
  };

  const onCreateInvite = (meetingId: Id<"meetings">) => {
    const meetingKey = meetingId as string;
    startTransition(async () => {
      setStatus(null);

      try {
        const invite = await createInvite({
          meetingId,
          email: inviteEmailByMeeting[meetingKey]?.trim() || undefined,
          displayName: inviteNameByMeeting[meetingKey]?.trim() || undefined,
        });

        setInviteEmailByMeeting((current) => ({ ...current, [meetingKey]: "" }));
        setInviteNameByMeeting((current) => ({ ...current, [meetingKey]: "" }));
        setStatus(`Invite created: /join/${invite.code}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not create invite.");
      }
    });
  };

  const onRevokeInvite = (inviteId: Id<"meetingInvites">) => {
    startTransition(async () => {
      setStatus(null);

      try {
        await revokeInvite({ inviteId });
        setStatus("Invite revoked.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not revoke invite.");
      }
    });
  };

  const onEndMeeting = (meetingId: Id<"meetings">, title: string) => {
    const confirmed = window.confirm(
      `End "${title}" for everyone? This cannot be undone and nobody will be able to rejoin.`,
    );
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      setStatus(null);

      try {
        const result = await endMeeting({ meetingId });
        const transcriptStatus = result.transcriptSync
          ? ` Transcript sync: ${result.transcriptSync.syncedCount}/${result.transcriptSync.availableCount}.`
          : "";
        setStatus(`Meeting ended for all participants: /room/${result.callId}.${transcriptStatus}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not end the meeting.");
      }
    });
  };

  const onSyncTranscripts = (meetingId: Id<"meetings">, title: string) => {
    startTransition(async () => {
      setStatus(null);

      try {
        const result = await syncMeetingTranscripts({ meetingId });
        if (result.skipped) {
          setStatus(`Transcription is disabled for "${title}".`);
          return;
        }

        setStatus(
          `Transcript sync finished for "${title}": ${result.syncedCount}/${result.availableCount}.`,
        );
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not sync transcripts.");
      }
    });
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-black/10 bg-white/75 p-5 backdrop-blur-sm md:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/55">Pensatori Meet</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black md:text-4xl">
                Meetings for staff and clients
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-black/70">
                Create instant or scheduled sessions, generate invitation links, and let guests join
                without Clerk sign-in.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-black/70">
                {nextMeeting
                  ? `Next: ${nextMeeting.title} • ${formatDate(nextMeeting.startsAt)}`
                  : "No upcoming meetings yet"}
              </div>
              <UserButton />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-5">
            <h2 className="text-lg font-semibold text-black">Start now</h2>
            <p className="mt-1 text-sm text-black/65">Open an instant room and share invites.</p>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Instant meeting title"
                value={instantTitle}
                onChange={(event) => setInstantTitle(event.target.value)}
              />
              <Button onClick={onCreateInstantMeeting} disabled={isPending}>
                Create
              </Button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-black/70">
              <input
                type="checkbox"
                checked={instantTranscriptionEnabled}
                onChange={(event) => setInstantTranscriptionEnabled(event.target.checked)}
              />
              Enable transcription
            </label>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/80 p-5">
            <h2 className="text-lg font-semibold text-black">Schedule</h2>
            <p className="mt-1 text-sm text-black/65">
              Create a meeting in advance and send the join links.
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-[1fr_190px_auto]">
              <Input
                placeholder="Scheduled meeting title"
                value={scheduledTitle}
                onChange={(event) => setScheduledTitle(event.target.value)}
              />
              <Input
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
              />
              <Button onClick={onScheduleMeeting} disabled={isPending}>
                Schedule
              </Button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-black/70">
              <input
                type="checkbox"
                checked={scheduledTranscriptionEnabled}
                onChange={(event) => setScheduledTranscriptionEnabled(event.target.checked)}
              />
              Enable transcription
            </label>
          </div>
        </section>

        {status ? (
          <section className="rounded-xl border border-black/15 bg-black px-4 py-3 text-sm text-white">
            {status}
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-black">Your meetings</h2>
          <div className="grid gap-4">
            {meetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/20 bg-white/60 p-8 text-sm text-black/65">
                No meetings yet. Create one above to get started.
              </div>
            ) : null}

            {meetings.map((meeting) => {
              const meetingId = meeting._id as Id<"meetings">;
              const meetingKey = meetingId as string;
              return (
                <article
                  key={meeting._id}
                  className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-black">{meeting.title}</h3>
                      <p className="mt-1 text-sm text-black/70">
                        {meeting.kind === "scheduled" ? "Scheduled" : "Instant"} • {" "}
                        {formatDate(meeting.startsAt)}
                        {meeting.transcriptionEnabled ? " • Transcription enabled" : ""}
                        {meeting.endedAt ? " • Ended" : ""}
                      </p>
                      {meeting.description ? (
                        <p className="mt-1 text-sm text-black/60">{meeting.description}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href={`/room/${meeting.callId}`}>
                          {meeting.endedAt ? "View room" : "Join room"}
                        </Link>
                      </Button>
                      {!meeting.endedAt ? (
                        <Button
                          variant="destructive"
                          onClick={() => onEndMeeting(meetingId, meeting.title)}
                          disabled={isPending}
                        >
                          End call for all
                        </Button>
                      ) : null}
                      {meeting.transcriptionEnabled ? (
                        <Button
                          variant="outline"
                          onClick={() => onSyncTranscripts(meetingId, meeting.title)}
                          disabled={isPending}
                        >
                          Sync transcripts
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {!meeting.endedAt ? (
                    <div className="mt-4 rounded-xl border border-black/10 bg-[#f8f7f2] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                        Invite people
                      </p>
                      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                          type="email"
                          placeholder="Optional email restriction"
                          value={inviteEmailByMeeting[meetingKey] ?? ""}
                          onChange={(event) =>
                            setInviteEmailByMeeting((current) => ({
                              ...current,
                              [meetingKey]: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Invite display name"
                          value={inviteNameByMeeting[meetingKey] ?? ""}
                          onChange={(event) =>
                            setInviteNameByMeeting((current) => ({
                              ...current,
                              [meetingKey]: event.target.value,
                            }))
                          }
                        />
                        <Button onClick={() => onCreateInvite(meetingId)} disabled={isPending}>
                          New invite link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-black/10 bg-[#f8f7f2] p-3 text-sm text-black/60">
                      This meeting has ended and invite links are disabled.
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {meeting.invites.length === 0 ? (
                      <p className="text-sm text-black/55">No invites yet.</p>
                    ) : null}
                    {meeting.invites.map((invite) => (
                      <div
                        key={invite._id}
                        className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-mono text-xs text-black/80">/join/{invite.code}</p>
                          <p className="text-xs text-black/55">
                            {invite.email ? `Restricted to ${invite.email}` : "Open guest invite"}
                            {invite.revokedAt ? " • Revoked" : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            disabled={Boolean(invite.revokedAt)}
                            onClick={() => copyInvite(invite.code)}
                          >
                            Copy link
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={Boolean(invite.revokedAt)}
                            onClick={() => onRevokeInvite(invite._id as Id<"meetingInvites">)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {meeting.transcriptionEnabled ? (
                    <div className="mt-4 rounded-xl border border-black/10 bg-[#f8f7f2] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                        Transcript
                      </p>
                      <MeetingTranscriptsSection meetingId={meetingId} />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
