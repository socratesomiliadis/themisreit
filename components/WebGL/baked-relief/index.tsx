"use client";

import React, {
  useRef,
  useState,
  useEffect,
  memo,
  useId,
  startTransition,
  useMemo,
} from "react";
import { Canvas } from "@react-three/fiber";

import type { BakedReliefProps } from "./types";
import {
  DEFAULT_TEXTURE_SCALE,
  DEFAULT_TEXTURE_STRENGTH,
  DEFAULT_MULTIPLY_COLOR,
  DEFAULT_FRESNEL_ENABLED,
  DEFAULT_FRESNEL_COLOR,
  DEFAULT_FRESNEL_STRENGTH,
  DEFAULT_TRAIL_SIZE,
  DEFAULT_TRAIL_FADE_SPEED,
  DEFAULT_TRAIL_MAX_AGE,
  DEFAULT_TRAIL_INTENSITY,
  DEFAULT_AMBIENT_INTENSITY,
  DEFAULT_MOUSE_LERP,
  DEFAULT_MOUSE_INFLUENCE,
  DEFAULT_ROTATION_SPEED,
  DEFAULT_EDGE_FADE,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_TRAIL_RESOLUTION,
} from "./types";
import { BakedReliefPlane } from "./baked-relief-plane";
import { getQualitySettings } from "./performance";

// Re-export types for external use
export type { BakedReliefProps, BakedTextures } from "./types";

// ============================================================================
// STAGGERED INITIALIZATION QUEUE
// Prevents multiple BakedRelief instances from initializing simultaneously
// ============================================================================
type QueuedInit = {
  id: string;
  callback: () => void;
};

const initQueue: QueuedInit[] = [];
let isProcessingQueue = false;
let lastInitTime = 0;
const MIN_INIT_DELAY = 150;

function queueInitialization(id: string, callback: () => void): () => void {
  const item: QueuedInit = { id, callback };
  initQueue.push(item);
  processQueue();

  return () => {
    const index = initQueue.findIndex((i) => i.id === id);
    if (index !== -1) {
      initQueue.splice(index, 1);
    }
  };
}

function processQueue(): void {
  if (isProcessingQueue || initQueue.length === 0) return;

  isProcessingQueue = true;

  const processNext = () => {
    if (initQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }

    const now = performance.now();
    const timeSinceLastInit = now - lastInitTime;
    const delay = Math.max(0, MIN_INIT_DELAY - timeSinceLastInit);

    setTimeout(() => {
      const item = initQueue.shift();
      if (item) {
        lastInitTime = performance.now();
        requestAnimationFrame(() => {
          item.callback();
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(() => processNext(), { timeout: 200 });
          } else {
            setTimeout(processNext, 50);
          }
        });
      } else {
        isProcessingQueue = false;
      }
    }, delay);
  };

  processNext();
}

// ============================================================================
// MAIN COMPONENT — single-enum state machine instead of 3+ booleans
// ============================================================================

type InitPhase = "pending" | "ready" | "active";

function BakedReliefInner({
  textures,
  textureScale = DEFAULT_TEXTURE_SCALE,
  textureStrength = DEFAULT_TEXTURE_STRENGTH,
  multiplyColor = DEFAULT_MULTIPLY_COLOR,
  fresnelEnabled = DEFAULT_FRESNEL_ENABLED,
  fresnelColor = DEFAULT_FRESNEL_COLOR,
  fresnelStrength = DEFAULT_FRESNEL_STRENGTH,
  trailSize = DEFAULT_TRAIL_SIZE,
  trailFadeSpeed = DEFAULT_TRAIL_FADE_SPEED,
  trailMaxAge = DEFAULT_TRAIL_MAX_AGE,
  trailIntensity = DEFAULT_TRAIL_INTENSITY,
  ambientIntensity = DEFAULT_AMBIENT_INTENSITY,
  mouseLerp = DEFAULT_MOUSE_LERP,
  mouseInfluence = DEFAULT_MOUSE_INFLUENCE,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  edgeFade = DEFAULT_EDGE_FADE,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  trailResolution = DEFAULT_TRAIL_RESOLUTION,
  pauseWhenHidden = true,
  className = "",
  style,
}: BakedReliefProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();
  const [phase, setPhase] = useState<InitPhase>("pending");
  const [isVisible, setIsVisible] = useState(false);

  const qualitySettings = useMemo(() => getQualitySettings(), []);

  // Staggered initialization — queue callback fires rAF then transitions
  useEffect(() => {
    let rAF: number | undefined;
    const cleanup = queueInitialization(instanceId, () => {
      rAF = requestAnimationFrame(() => {
        startTransition(() => setPhase("ready"));
      });
    });

    return () => {
      cleanup();
      if (rAF !== undefined) cancelAnimationFrame(rAF);
    };
  }, [instanceId]);

  // Delayed activation — gives time for shader compilation
  useEffect(() => {
    if (phase !== "ready") return;

    const timer = setTimeout(() => {
      startTransition(() => setPhase("active"));
    }, 200);

    return () => clearTimeout(timer);
  }, [phase]);

  // IntersectionObserver for visibility
  useEffect(() => {
    if (phase === "pending") return;

    if (!pauseWhenHidden) {
      setIsVisible(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        startTransition(() => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.01, rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [pauseWhenHidden, phase]);

  const containerStyle = { width: "100%", height: "100%", ...style };

  if (phase === "pending") {
    return (
      <div ref={containerRef} className={className} style={containerStyle} />
    );
  }

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <Canvas
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          depth: false,
          stencil: false,
          precision: "mediump",
          preserveDrawingBuffer: false,
        }}
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        frameloop={phase === "active" ? "always" : "demand"}
        dpr={qualitySettings.dpr}
        flat
      >
        <BakedReliefPlane
          textures={textures}
          textureScale={textureScale}
          textureStrength={textureStrength}
          multiplyColor={multiplyColor}
          fresnelEnabled={fresnelEnabled}
          fresnelColor={fresnelColor}
          fresnelStrength={fresnelStrength}
          trailSize={trailSize}
          trailFadeSpeed={trailFadeSpeed}
          trailMaxAge={trailMaxAge}
          trailIntensity={trailIntensity}
          ambientIntensity={ambientIntensity}
          mouseLerp={mouseLerp}
          mouseInfluence={mouseInfluence}
          rotationSpeed={rotationSpeed}
          edgeFade={edgeFade}
          aspectRatio={aspectRatio}
          trailResolution={trailResolution}
          isVisible={isVisible}
        />
      </Canvas>
    </div>
  );
}

const BakedRelief = memo(BakedReliefInner);

export default BakedRelief;
