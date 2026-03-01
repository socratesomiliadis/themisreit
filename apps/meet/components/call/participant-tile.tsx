"use client";

import {
  ParticipantView,
  type StreamVideoParticipant,
  type VideoPlaceholderProps,
} from "@stream-io/video-react-sdk";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

import { initials } from "@/components/call/utils";

const AUDIO_TRACK_TYPE = 1;

function ParticipantPlaceholder({ participant }: VideoPlaceholderProps) {
  const name = participant.name || participant.userId || "Guest";

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#17191f]">
      <Avatar className="size-32 border border-white/20" size="lg">
        {participant.image ? <AvatarImage src={participant.image} alt={name} /> : null}
        <AvatarFallback className="bg-[#0e1118] text-4xl font-medium text-white">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

export function ParticipantTile({ participant }: { participant: StreamVideoParticipant }) {
  const participantName = participant.name || participant.userId || "Guest";
  const isMuted = !participant.publishedTracks.includes(AUDIO_TRACK_TYPE);

  return (
    <article className="relative h-[320px] overflow-hidden bg-[#141518] md:h-[380px]">
      <ParticipantView
        participant={participant}
        trackType="videoTrack"
        ParticipantViewUI={null}
        VideoPlaceholder={ParticipantPlaceholder}
        className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />
      <div className="absolute top-4 left-4 flex size-8 items-center justify-center rounded-full bg-white text-[11px] font-black text-black">
        ••
      </div>
      <div className="absolute right-4 bottom-4 rounded-full border border-white/20 bg-black/65 px-2 py-0.5 text-[11px] text-white/90">
        {isMuted ? "Muted" : "Live"}
      </div>
      <p className="absolute bottom-4 left-4 text-[30px] leading-none tracking-tight text-white drop-shadow-sm">
        {participantName}
      </p>
    </article>
  );
}
