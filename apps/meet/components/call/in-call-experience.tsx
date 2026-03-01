"use client";

import { useEffect, useMemo, useState } from "react";
import { CallingState, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import type { Channel } from "stream-chat";

import { CallSettingsSheet } from "@/components/call/call-settings-sheet";
import { ControlButton } from "@/components/call/control-button";
import { InCallChatPanel } from "@/components/call/in-call-chat-panel";
import { ParticipantTile } from "@/components/call/participant-tile";

type NoiseSuppressionState = {
  canUseNoiseSuppression: boolean;
  isReady: boolean;
  isAvailable: boolean;
  isEnabled: boolean;
  suppressionLevel: number;
  error: string | null;
  setNoiseEnabled: (next: boolean) => Promise<void>;
  setSuppressionLevel: (level: number) => void;
};

type InCallExperienceProps = {
  meetingTitle: string;
  onLeave: () => Promise<void>;
  noiseSuppression: NoiseSuppressionState;
  chatChannel: Channel;
  currentUserId?: string;
};

export function InCallExperience({
  meetingTitle,
  onLeave,
  noiseSuppression,
  chatChannel,
  currentUserId,
}: InCallExperienceProps) {
  const call = useCall();
  const { useCallCallingState, useParticipants, useMicrophoneState, useCameraState } =
    useCallStateHooks();

  const callingState = useCallCallingState();
  const participants = useParticipants();
  const { microphone, optionsAwareIsMute: isMicMuted } = useMicrophoneState({
    optimisticUpdates: true,
  });
  const { camera, optionsAwareIsMute: isCamMuted } = useCameraState({
    optimisticUpdates: true,
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleParticipants = useMemo(() => {
    return participants.slice(0, 6);
  }, [participants]);

  const onReaction = async () => {
    if (!call) {
      return;
    }

    try {
      await call.sendReaction({ type: "reaction", emoji_code: "🔥" });
      setNotice("Reaction sent");
    } catch {
      setNotice("Could not send reaction");
    }
  };

  const onToggleMic = async () => {
    try {
      await microphone.toggle();
    } catch {
      setNotice("Microphone permission required");
    }
  };

  const onToggleCamera = async () => {
    try {
      await camera.toggle();
    } catch {
      setNotice("Camera permission required");
    }
  };

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07090c] text-sm text-white/65">
        Joining call...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090c] text-white">
      <header className="pt-8 text-center">
        <p className="text-[70px] leading-none tracking-tight text-[#0d162a]">pensatori meet</p>
        <p className="mt-2 text-sm text-white/50">{meetingTitle}</p>
      </header>

      <section className="mx-auto mt-14 grid w-full max-w-[1380px] gap-4 px-4 pb-40 md:grid-cols-2">
        {visibleParticipants.length === 0 ? (
          <div className="col-span-full grid h-[380px] place-items-center bg-[#141518] text-sm text-white/55">
            Waiting for participants...
          </div>
        ) : null}

        {visibleParticipants.map((participant) => (
          <ParticipantTile key={participant.sessionId} participant={participant} />
        ))}
      </section>

      <div className="fixed inset-x-0 bottom-8 z-20 flex justify-center px-4">
        <div className="flex items-center gap-4 rounded-full bg-black/30 px-6 py-4 backdrop-blur-md">
          <ControlButton label="☺" title="Send reaction" onClick={() => void onReaction()} />
          <ControlButton
            label="🎤"
            title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
            onClick={() => void onToggleMic()}
            muted={isMicMuted}
          />
          <ControlButton
            label="🎥"
            title={isCamMuted ? "Turn camera on" : "Turn camera off"}
            onClick={() => void onToggleCamera()}
            muted={isCamMuted}
          />
          <ControlButton label="⚙" title="Open settings" onClick={() => setSettingsOpen(true)} />
          <ControlButton
            label="💬"
            title={chatOpen ? "Close chat" : "Open chat"}
            onClick={() => setChatOpen((current) => !current)}
            badgeCount={chatOpen ? 0 : chatUnreadCount}
          />
          <ControlButton label="📞" title="Leave call" onClick={() => void onLeave()} danger />
        </div>
      </div>

      {notice ? (
        <div className="fixed top-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs text-white/90">
          {notice}
        </div>
      ) : null}

      <CallSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        noiseSuppression={noiseSuppression}
      />
      <InCallChatPanel
        channel={chatChannel}
        currentUserId={currentUserId}
        open={chatOpen}
        onOpenChange={setChatOpen}
        onUnreadCountChange={setChatUnreadCount}
      />
    </div>
  );
}
