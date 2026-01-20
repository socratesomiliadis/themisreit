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
const MIN_INIT_DELAY = 150; // Minimum ms between initializations

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
        // Use requestAnimationFrame to ensure we're not blocking paint
        requestAnimationFrame(() => {
          item.callback();
          // Use requestIdleCallback for next item to avoid blocking
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
// MAIN COMPONENT
// ============================================================================

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
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [frameloopMode, setFrameloopMode] = useState<"demand" | "always">(
    "demand"
  );

  // Get quality settings based on device capabilities
  const qualitySettings = useMemo(() => getQualitySettings(), []);

  // Staggered initialization - prevents multiple instances from blocking
  useEffect(() => {
    const cleanup = queueInitialization(instanceId, () => {
      // Use startTransition to mark this as non-urgent
      startTransition(() => {
        setIsInitialized(true);
      });
    });

    return cleanup;
  }, [instanceId]);

  // Delayed Canvas activation - gives time for shader compilation
  useEffect(() => {
    if (!isInitialized) return;

    // Small delay to allow React to paint the container first
    const timer = requestAnimationFrame(() => {
      setIsCanvasReady(true);

      // Switch to continuous rendering after a delay
      const frameloopTimer = setTimeout(() => {
        startTransition(() => {
          setFrameloopMode("always");
        });
      }, 200);

      return () => clearTimeout(frameloopTimer);
    });

    return () => cancelAnimationFrame(timer);
  }, [isInitialized]);

  // IntersectionObserver for visibility
  useEffect(() => {
    if (!pauseWhenHidden || !isCanvasReady) {
      if (isCanvasReady) setIsVisible(true);
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
  }, [pauseWhenHidden, isCanvasReady]);

  const containerStyle = { width: "100%", height: "100%", ...style };

  // Render placeholder until initialized
  if (!isInitialized) {
    return (
      <div ref={containerRef} className={className} style={containerStyle} />
    );
  }

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {isCanvasReady && (
        <Canvas
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            depth: false,
            stencil: false,
            // Reduce memory by limiting precision where possible
            precision: "mediump",
            // Prevent preserving drawing buffer (faster)
            preserveDrawingBuffer: false,
          }}
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
          frameloop={frameloopMode}
          // Use quality-based DPR
          dpr={qualitySettings.dpr}
          // Flat mode skips some R3F overhead
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
      )}
    </div>
  );
}

// Memoize the main component
const BakedRelief = memo(BakedReliefInner);

export default BakedRelief;
