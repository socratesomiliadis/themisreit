"use client";

import { useMemo, useState } from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";

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

type CallSettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noiseSuppression: NoiseSuppressionState;
};

const DEFAULT_DEVICE = "__default";

export function CallSettingsSheet({
  open,
  onOpenChange,
  noiseSuppression,
}: CallSettingsSheetProps) {
  const { useMicrophoneState, useCameraState, useSpeakerState } = useCallStateHooks();

  const { microphone, devices: microphoneDevices, selectedDevice: selectedMicrophone } =
    useMicrophoneState({ optimisticUpdates: true });
  const { camera, devices: cameraDevices, selectedDevice: selectedCamera } = useCameraState({
    optimisticUpdates: true,
  });
  const speakerState = useSpeakerState();

  const [settingsError, setSettingsError] = useState<string | null>(null);

  const microphoneOptions = useMemo(() => {
    return microphoneDevices.map((device, index) => ({
      value: device.deviceId,
      label: device.label || `Microphone ${index + 1}`,
    }));
  }, [microphoneDevices]);

  const cameraOptions = useMemo(() => {
    return cameraDevices.map((device, index) => ({
      value: device.deviceId,
      label: device.label || `Camera ${index + 1}`,
    }));
  }, [cameraDevices]);

  const speakerOptions = useMemo(() => {
    return speakerState.devices.map((device, index) => ({
      value: device.deviceId,
      label: device.label || `Speaker ${index + 1}`,
    }));
  }, [speakerState.devices]);

  const onSelectMicrophone = async (value: string) => {
    setSettingsError(null);

    try {
      await microphone.select(value === DEFAULT_DEVICE ? undefined : value);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Could not switch microphone.");
    }
  };

  const onSelectCamera = async (value: string) => {
    setSettingsError(null);

    try {
      await camera.select(value === DEFAULT_DEVICE ? undefined : value);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Could not switch camera.");
    }
  };

  const onSelectSpeaker = (value: string) => {
    setSettingsError(null);

    try {
      speakerState.speaker.select(value === DEFAULT_DEVICE ? "" : value);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Could not switch speaker.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="border-white/10 bg-[#090c12] p-0 text-white [&_[data-slot=sheet-close]]:text-white/70"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <SheetTitle className="text-white">Call settings</SheetTitle>
          <SheetDescription className="text-white/65">
            Select your devices and tune audio processing.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-5 py-5">
          <section className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
              Microphone
            </p>
            <select
              value={selectedMicrophone ?? DEFAULT_DEVICE}
              onChange={(event) => void onSelectMicrophone(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/15 bg-[#141924] px-3 text-sm text-white outline-none"
            >
              <option value={DEFAULT_DEVICE}>System default</option>
              {microphoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">Camera</p>
            <select
              value={selectedCamera ?? DEFAULT_DEVICE}
              onChange={(event) => void onSelectCamera(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/15 bg-[#141924] px-3 text-sm text-white outline-none"
            >
              <option value={DEFAULT_DEVICE}>System default</option>
              {cameraOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          {speakerState.isDeviceSelectionSupported ? (
            <section className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
                Speaker
              </p>
              <select
                value={speakerState.selectedDevice || DEFAULT_DEVICE}
                onChange={(event) => onSelectSpeaker(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-[#141924] px-3 text-sm text-white outline-none"
              >
                <option value={DEFAULT_DEVICE}>System default</option>
                {speakerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </section>
          ) : null}

          <section className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Noise suppression</p>
                <p className="text-xs text-white/65">
                  Reduce background sounds for cleaner voice quality.
                </p>
              </div>
              <Button
                variant={noiseSuppression.isEnabled ? "secondary" : "outline"}
                size="sm"
                disabled={
                  !noiseSuppression.canUseNoiseSuppression ||
                  !noiseSuppression.isReady ||
                  !noiseSuppression.isAvailable
                }
                onClick={() => void noiseSuppression.setNoiseEnabled(!noiseSuppression.isEnabled)}
              >
                {noiseSuppression.isEnabled ? "On" : "Off"}
              </Button>
            </div>

            {noiseSuppression.canUseNoiseSuppression &&
            noiseSuppression.isReady &&
            noiseSuppression.isAvailable ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-white/65">
                  <span>Suppression level</span>
                  <span>{noiseSuppression.suppressionLevel}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={noiseSuppression.suppressionLevel}
                  onChange={(event) => noiseSuppression.setSuppressionLevel(Number(event.target.value))}
                  className="w-full accent-white"
                />
              </div>
            ) : null}

            {!noiseSuppression.canUseNoiseSuppression ? (
              <p className="text-xs text-amber-200/80">
                This call type or account does not allow noise suppression.
              </p>
            ) : null}

            {noiseSuppression.canUseNoiseSuppression && !noiseSuppression.isReady ? (
              <p className="text-xs text-white/65">Preparing noise suppression engine...</p>
            ) : null}

            {noiseSuppression.canUseNoiseSuppression &&
            noiseSuppression.isReady &&
            !noiseSuppression.isAvailable ? (
              <p className="text-xs text-amber-200/80">
                Noise suppression engine is unavailable. Ensure internet access to load Stream audio
                filters.
              </p>
            ) : null}

            {noiseSuppression.error ? (
              <p className="text-xs text-rose-300">{noiseSuppression.error}</p>
            ) : null}
          </section>

          {settingsError ? <p className="text-xs text-rose-300">{settingsError}</p> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
