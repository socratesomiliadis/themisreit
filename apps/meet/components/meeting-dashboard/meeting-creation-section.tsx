"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

type MeetingCreationSectionProps = {
  instantTitle: string;
  setInstantTitle: (value: string) => void;
  instantTranscriptionEnabled: boolean;
  setInstantTranscriptionEnabled: (value: boolean) => void;
  onCreateInstantMeeting: () => void;
  scheduledTitle: string;
  setScheduledTitle: (value: string) => void;
  scheduledFor: string;
  setScheduledFor: (value: string) => void;
  scheduledTranscriptionEnabled: boolean;
  setScheduledTranscriptionEnabled: (value: boolean) => void;
  onScheduleMeeting: () => void;
  isPending: boolean;
};

export function MeetingCreationSection({
  instantTitle,
  setInstantTitle,
  instantTranscriptionEnabled,
  setInstantTranscriptionEnabled,
  onCreateInstantMeeting,
  scheduledTitle,
  setScheduledTitle,
  scheduledFor,
  setScheduledFor,
  scheduledTranscriptionEnabled,
  setScheduledTranscriptionEnabled,
  onScheduleMeeting,
  isPending,
}: MeetingCreationSectionProps) {
  return (
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
  );
}
