"use client";

import { useState } from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

import { CallSettingsSheet } from "@/components/call/call-settings-sheet";
import { ControlButton } from "@/components/call/control-button";
import { LocalPreview } from "@/components/call/local-preview";
import { Button } from "@workspace/ui/components/button";

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

type PreJoinScreenProps = {
  meetingTitle: string;
  userLabel: string;
  userImage?: string;
  isJoining: boolean;
  onJoin: () => Promise<void>;
  onCancel: () => Promise<void>;
  noiseSuppression: NoiseSuppressionState;
};

export function PreJoinScreen({
  meetingTitle,
  userLabel,
  userImage,
  isJoining,
  onJoin,
  onCancel,
  noiseSuppression,
}: PreJoinScreenProps) {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const { microphone, optionsAwareIsMute: isMicMuted } = useMicrophoneState({
    optimisticUpdates: true,
  });
  const { camera, optionsAwareIsMute: isCamMuted, mediaStream } = useCameraState({
    optimisticUpdates: true,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const onToggleMic = async () => {
    try {
      await microphone.toggle();
    } catch {
      setNotice("Microphone permission is required.");
    }
  };

  const onToggleCamera = async () => {
    try {
      await camera.toggle();
    } catch {
      setNotice("Camera permission is required.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07090c] px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="text-center">
          <p className="text-[58px] leading-none tracking-tight text-[#0d162a] md:text-[74px]">
            pensatori meet
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{meetingTitle}</h1>
          <p className="mt-1 text-sm text-white/65">Check your setup before joining the room.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#0f1218] p-3 md:p-4">
          <LocalPreview
            name={userLabel}
            image={userImage}
            mediaStream={mediaStream}
            muted={isCamMuted}
          />
        </section>

        <section className="flex flex-wrap items-center justify-center gap-4">
          <ControlButton
            label="🎤"
            title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
            onClick={() => void onToggleMic()}
            muted={isMicMuted}
            disabled={isJoining}
          />
          <ControlButton
            label="🎥"
            title={isCamMuted ? "Turn camera on" : "Turn camera off"}
            onClick={() => void onToggleCamera()}
            muted={isCamMuted}
            disabled={isJoining}
          />
          <ControlButton
            label="⚙"
            title="Open settings"
            onClick={() => setSettingsOpen(true)}
            disabled={isJoining}
          />
        </section>

        <section className="mx-auto flex w-full max-w-md gap-3">
          <Button
            variant="outline"
            className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={() => void onCancel()}
            disabled={isJoining}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => void onJoin()} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join call"}
          </Button>
        </section>

        {notice ? (
          <p className="text-center text-xs text-amber-200/90">{notice}</p>
        ) : null}
      </div>

      <CallSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        noiseSuppression={noiseSuppression}
      />
    </div>
  );
}
