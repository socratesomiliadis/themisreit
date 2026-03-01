"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@/lib/convex-api";
import { DashboardHeader } from "@/components/meeting-dashboard/dashboard-header";
import { MeetingCreationSection } from "@/components/meeting-dashboard/meeting-creation-section";
import { MeetingList } from "@/components/meeting-dashboard/meeting-list";
import { TranscriptSheet } from "@/components/meeting-dashboard/transcript-sheet";
import type { DashboardMeeting, TranscriptPanelData } from "@/components/meeting-dashboard/types";

function formatDate(ts?: number) {
  if (!ts) {
    return "Starts immediately";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function MeetingDashboard() {
  const meetingsQuery = useQuery(api.meetings.listForViewer);
  const meetings = useMemo(() => (meetingsQuery ?? []) as DashboardMeeting[], [meetingsQuery]);
  const createInstantMeeting = useMutation(api.meetings.createInstantMeeting);
  const scheduleMeeting = useMutation(api.meetings.scheduleMeeting);
  const createInvite = useMutation(api.meetings.createInvite);
  const revokeInvite = useMutation(api.meetings.revokeInvite);
  const endMeeting = useAction(api.stream.endMeetingForAll);
  const openMeetingTranscriptFile = useAction(api.stream.openMeetingTranscriptFile);

  const [instantTitle, setInstantTitle] = useState("");
  const [instantTranscriptionEnabled, setInstantTranscriptionEnabled] = useState(false);
  const [scheduledTitle, setScheduledTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduledTranscriptionEnabled, setScheduledTranscriptionEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [inviteEmailByMeeting, setInviteEmailByMeeting] = useState<Record<string, string>>({});
  const [inviteNameByMeeting, setInviteNameByMeeting] = useState<Record<string, string>>({});
  const [transcriptPanel, setTranscriptPanel] = useState<TranscriptPanelData | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const refreshNow = () => setNowMs(Date.now());
    refreshNow();
    const timer = window.setInterval(refreshNow, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const nextMeeting = useMemo(() => {
    return meetings.find((meeting) => !meeting.endedAt && (meeting.startsAt ?? nowMs) >= nowMs);
  }, [meetings, nowMs]);

  const copyInvite = async (inviteCode: string) => {
    const invitePath = `/join/${inviteCode}`;
    const fullInvite =
      typeof window === "undefined" ? invitePath : new URL(invitePath, window.location.origin).toString();

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
        setStatus(`Meeting ended for all participants: /room/${result.callId}.`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not end the meeting.");
      }
    });
  };

  const onOpenTranscriptFile = (meetingId: Id<"meetings">, title: string) => {
    startTransition(async () => {
      setStatus(null);

      try {
        const result = await openMeetingTranscriptFile({ meetingId });
        setTranscriptPanel({
          meetingTitle: title,
          callId: result.callId,
          filename: result.filename,
          availableCount: result.availableCount,
          startTime: result.startTime,
          endTime: result.endTime,
          utterances: result.utterances,
        });
        setIsTranscriptOpen(true);
        setStatus(`Loaded transcript for "${title}".`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load transcript.");
      }
    });
  };

  const nextMeetingLabel = nextMeeting
    ? `Next: ${nextMeeting.title} • ${formatDate(nextMeeting.startsAt)}`
    : "No upcoming meetings yet";

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DashboardHeader nextMeetingLabel={nextMeetingLabel} />

        <MeetingCreationSection
          instantTitle={instantTitle}
          setInstantTitle={setInstantTitle}
          instantTranscriptionEnabled={instantTranscriptionEnabled}
          setInstantTranscriptionEnabled={setInstantTranscriptionEnabled}
          onCreateInstantMeeting={onCreateInstantMeeting}
          scheduledTitle={scheduledTitle}
          setScheduledTitle={setScheduledTitle}
          scheduledFor={scheduledFor}
          setScheduledFor={setScheduledFor}
          scheduledTranscriptionEnabled={scheduledTranscriptionEnabled}
          setScheduledTranscriptionEnabled={setScheduledTranscriptionEnabled}
          onScheduleMeeting={onScheduleMeeting}
          isPending={isPending}
        />

        {status ? (
          <section className="rounded-xl border border-black/15 bg-black px-4 py-3 text-sm text-white">
            {status}
          </section>
        ) : null}

        <MeetingList
          meetings={meetings}
          formatDate={formatDate}
          isPending={isPending}
          inviteEmailByMeeting={inviteEmailByMeeting}
          inviteNameByMeeting={inviteNameByMeeting}
          setInviteEmailByMeeting={setInviteEmailByMeeting}
          setInviteNameByMeeting={setInviteNameByMeeting}
          onEndMeeting={onEndMeeting}
          onOpenTranscriptFile={onOpenTranscriptFile}
          onCreateInvite={onCreateInvite}
          onRevokeInvite={onRevokeInvite}
          copyInvite={copyInvite}
        />
      </div>

      <TranscriptSheet
        open={isTranscriptOpen}
        onOpenChange={setIsTranscriptOpen}
        transcriptPanel={transcriptPanel}
      />
    </main>
  );
}
