import type { Id } from "@convex/_generated/dataModel";

export type DashboardInvite = {
  _id: Id<"meetingInvites">;
  code: string;
  email?: string;
  revokedAt?: number;
};

export type DashboardMeeting = {
  _id: Id<"meetings">;
  callId: string;
  title: string;
  description?: string;
  transcriptionEnabled: boolean;
  kind: "instant" | "scheduled";
  startsAt?: number;
  endedAt?: number;
  invites: DashboardInvite[];
};

export type TranscriptUtterance = {
  id: string;
  speaker: string;
  text: string;
  startMs: number | null;
  endMs: number | null;
};

export type TranscriptPanelData = {
  meetingTitle: string;
  callId: string;
  filename: string;
  availableCount: number;
  startTime: string;
  endTime: string;
  utterances: TranscriptUtterance[];
};
