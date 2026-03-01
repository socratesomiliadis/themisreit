"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import type { TranscriptPanelData } from "./types";

function formatTranscriptTime(ms?: number | null) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    return "Unknown";
  }

  if (ms > 1_000_000_000_000) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(ms));
  }

  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatTranscriptRange(startMs?: number | null, endMs?: number | null) {
  const start = formatTranscriptTime(startMs);
  const end = formatTranscriptTime(endMs);
  if (start === "Unknown" && end === "Unknown") {
    return "Time unavailable";
  }

  if (end === "Unknown" || start === end) {
    return start;
  }

  return `${start} - ${end}`;
}

type TranscriptSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcriptPanel: TranscriptPanelData | null;
};

export function TranscriptSheet({
  open,
  onOpenChange,
  transcriptPanel,
}: TranscriptSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-black/10 pb-4">
          <SheetTitle>Transcript</SheetTitle>
          <SheetDescription>
            {transcriptPanel
              ? `${transcriptPanel.meetingTitle} • ${transcriptPanel.filename}`
              : "Meeting transcript"}
          </SheetDescription>
          {transcriptPanel ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-black/60">
              <span className="rounded-full border border-black/10 px-2 py-1">
                Call: {transcriptPanel.callId}
              </span>
              <span className="rounded-full border border-black/10 px-2 py-1">
                Segments: {transcriptPanel.utterances.length}
              </span>
              <span className="rounded-full border border-black/10 px-2 py-1">
                Files: {transcriptPanel.availableCount}
              </span>
              <span className="rounded-full border border-black/10 px-2 py-1">
                {transcriptPanel.startTime || transcriptPanel.endTime
                  ? `${transcriptPanel.startTime || "?"} -> ${transcriptPanel.endTime || "?"}`
                  : "Timing unavailable"}
              </span>
            </div>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {!transcriptPanel ? (
            <p className="text-sm text-black/60">No transcript loaded.</p>
          ) : (
            <div className="space-y-2">
              {transcriptPanel.utterances.map((utterance) => (
                <article
                  key={utterance.id}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-black">{utterance.speaker}</p>
                    <p className="font-mono text-xs text-black/55">
                      {formatTranscriptRange(utterance.startMs, utterance.endMs)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-black/80">{utterance.text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
