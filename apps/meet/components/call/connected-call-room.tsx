"use client";

import { InCallExperience } from "@/components/call/in-call-experience";
import { PreJoinScreen } from "@/components/call/prejoin-screen";
import { useNoiseSuppression } from "@/components/call/use-noise-suppression";
import type { Channel } from "stream-chat";

type ConnectedCallRoomProps = {
  meetingTitle: string;
  userLabel: string;
  userImage?: string;
  userId: string;
  chatChannel: Channel;
  joinState: "preview" | "joining" | "in-call";
  onJoin: () => Promise<void>;
  onCancel: () => Promise<void>;
  onLeave: () => Promise<void>;
};

export function ConnectedCallRoom({
  meetingTitle,
  userLabel,
  userImage,
  userId,
  chatChannel,
  joinState,
  onJoin,
  onCancel,
  onLeave,
}: ConnectedCallRoomProps) {
  const noiseSuppression = useNoiseSuppression();

  if (joinState === "in-call") {
    return (
      <InCallExperience
        meetingTitle={meetingTitle}
        onLeave={onLeave}
        noiseSuppression={noiseSuppression}
        chatChannel={chatChannel}
        currentUserId={userId}
      />
    );
  }

  return (
    <PreJoinScreen
      meetingTitle={meetingTitle}
      userLabel={userLabel}
      userImage={userImage}
      isJoining={joinState === "joining"}
      onJoin={onJoin}
      onCancel={onCancel}
      noiseSuppression={noiseSuppression}
    />
  );
}
