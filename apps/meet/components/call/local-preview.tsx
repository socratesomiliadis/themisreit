"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

import { initials } from "@/components/call/utils";

type LocalPreviewProps = {
  name: string;
  image?: string;
  mediaStream?: MediaStream;
  muted: boolean;
};

export function LocalPreview({ name, image, mediaStream, muted }: LocalPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (!mediaStream || muted) {
      videoElement.srcObject = null;
      return;
    }

    videoElement.srcObject = mediaStream;
    const playback = videoElement.play();
    if (playback) {
      void playback.catch(() => undefined);
    }

    return () => {
      videoElement.srcObject = null;
    };
  }, [mediaStream, muted]);

  return (
    <div className="relative h-[360px] overflow-hidden bg-[#13161d] md:h-[420px]">
      {mediaStream && !muted ? (
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar className="size-36 border border-white/25" size="lg">
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback className="bg-[#0f121a] text-4xl font-medium text-white">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />
      <p className="absolute bottom-4 left-4 text-2xl tracking-tight text-white">{name}</p>
    </div>
  );
}
