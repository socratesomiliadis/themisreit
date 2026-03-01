"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NoiseCancellationSettingsModeEnum,
  OwnCapability,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import type { INoiseCancellation } from "@stream-io/audio-filters-web";

export function useNoiseSuppression() {
  const call = useCall();
  const { useCallSettings, useHasPermissions } = useCallStateHooks();

  const settings = useCallSettings();
  const hasCapability = useHasPermissions(OwnCapability.ENABLE_NOISE_CANCELLATION);

  const isAllowedBySettings = useMemo(() => {
    if (!settings?.audio?.noise_cancellation) {
      return true;
    }

    return settings.audio.noise_cancellation.mode !== NoiseCancellationSettingsModeEnum.DISABLED;
  }, [settings?.audio?.noise_cancellation]);

  const [isReady, setIsReady] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [suppressionLevel, setSuppressionLevelState] = useState(50);
  const [error, setError] = useState<string | null>(null);

  const instanceRef = useRef<INoiseCancellation | null>(null);
  const suppressionLevelRef = useRef(50);

  useEffect(() => {
    suppressionLevelRef.current = suppressionLevel;
    instanceRef.current?.setSuppressionLevel(suppressionLevel);
  }, [suppressionLevel]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      if (!call || !hasCapability || !isAllowedBySettings) {
        setIsReady(true);
        setIsAvailable(false);
        return;
      }

      setError(null);
      setIsReady(false);

      try {
        const noiseModule = await import("@stream-io/audio-filters-web");

        if (cancelled) {
          return;
        }

        const noiseCancellation = new noiseModule.NoiseCancellation({});
        const supportResult = noiseCancellation.isSupported();
        const supported =
          typeof supportResult === "boolean" ? supportResult : await supportResult;

        if (!supported) {
          setIsAvailable(false);
          setIsReady(true);
          await noiseCancellation.dispose();
          return;
        }

        await noiseCancellation.init({ tracer: call.tracer });
        await call.microphone.enableNoiseCancellation(noiseCancellation);

        const enabled = await noiseCancellation.isEnabled();

        if (cancelled) {
          await call.microphone.disableNoiseCancellation();
          await noiseCancellation.dispose();
          return;
        }

        unsubscribe = noiseCancellation.on("change", (value) => setIsEnabled(value));
        instanceRef.current = noiseCancellation;
        setIsEnabled(enabled);
        noiseCancellation.setSuppressionLevel(suppressionLevelRef.current);
        setIsAvailable(true);
      } catch (setupError) {
        if (!cancelled) {
          setIsAvailable(false);
          setError(
            setupError instanceof Error
              ? setupError.message
              : "Noise suppression could not be initialized.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      const activeInstance = instanceRef.current;
      instanceRef.current = null;

      const teardown = async () => {
        if (unsubscribe) {
          unsubscribe();
        }

        if (activeInstance) {
          try {
            await call?.microphone.disableNoiseCancellation();
          } catch {
            // no-op
          }

          try {
            await activeInstance.dispose();
          } catch {
            // no-op
          }
        }
      };

      void teardown();
    };
  }, [call, hasCapability, isAllowedBySettings]);

  const setNoiseEnabled = useCallback(async (next: boolean) => {
    const instance = instanceRef.current;
    if (!instance) {
      return;
    }

    try {
      if (next) {
        await instance.enable();
      } else {
        await instance.disable();
      }
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update noise suppression.");
    }
  }, []);

  const setSuppressionLevel = useCallback((level: number) => {
    setSuppressionLevelState(level);
    instanceRef.current?.setSuppressionLevel(level);
  }, []);

  return {
    isReady,
    isAvailable,
    isEnabled,
    suppressionLevel,
    error,
    canUseNoiseSuppression: hasCapability && isAllowedBySettings,
    setNoiseEnabled,
    setSuppressionLevel,
  };
}
