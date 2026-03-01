"use client";

import Link from "next/link";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import type { DashboardMeeting } from "./types";

type MeetingListProps = {
  meetings: DashboardMeeting[];
  formatDate: (ts?: number) => string;
  isPending: boolean;
  inviteEmailByMeeting: Record<string, string>;
  inviteNameByMeeting: Record<string, string>;
  setInviteEmailByMeeting: (updater: (current: Record<string, string>) => Record<string, string>) => void;
  setInviteNameByMeeting: (updater: (current: Record<string, string>) => Record<string, string>) => void;
  onEndMeeting: (meetingId: Id<"meetings">, title: string) => void;
  onOpenTranscriptFile: (meetingId: Id<"meetings">, title: string) => void;
  onCreateInvite: (meetingId: Id<"meetings">) => void;
  onRevokeInvite: (inviteId: Id<"meetingInvites">) => void;
  copyInvite: (inviteCode: string) => void | Promise<void>;
};

export function MeetingList({
  meetings,
  formatDate,
  isPending,
  inviteEmailByMeeting,
  inviteNameByMeeting,
  setInviteEmailByMeeting,
  setInviteNameByMeeting,
  onEndMeeting,
  onOpenTranscriptFile,
  onCreateInvite,
  onRevokeInvite,
  copyInvite,
}: MeetingListProps) {
  return (
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
                    {meeting.kind === "scheduled" ? "Scheduled" : "Instant"} • {formatDate(meeting.startsAt)}
                    {meeting.transcriptionEnabled ? " • Transcription enabled" : ""}
                    {meeting.endedAt ? " • Ended" : ""}
                  </p>
                  {meeting.description ? (
                    <p className="mt-1 text-sm text-black/60">{meeting.description}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/room/${meeting.callId}`}>{meeting.endedAt ? "View room" : "Join room"}</Link>
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
                      onClick={() => onOpenTranscriptFile(meetingId, meeting.title)}
                      disabled={isPending}
                    >
                      View transcript
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
                {meeting.invites.length === 0 ? <p className="text-sm text-black/55">No invites yet.</p> : null}
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
