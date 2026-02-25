"use client";

import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  useCallback,
} from "react";
import type { Sketch, SketchSettings } from "ssam";

import type { BakedReliefProps, BakedTextures } from "./types";
import {
  DEFAULT_TEXTURE_SCALE,
  DEFAULT_TEXTURE_STRENGTH,
  DEFAULT_MULTIPLY_COLOR,
  DEFAULT_TRAIL_SIZE,
  DEFAULT_TRAIL_FADE_SPEED,
  DEFAULT_TRAIL_MAX_AGE,
  DEFAULT_TRAIL_INTENSITY,
  DEFAULT_AMBIENT_INTENSITY,
  DEFAULT_MOUSE_LERP,
  DEFAULT_MOUSE_INFLUENCE,
  DEFAULT_ROTATION_SPEED,
  DEFAULT_EDGE_FADE,
} from "./types";
import {
  checkWebGPUSupport,
  calculateSafePixelRatio,
  parseHexColor,
  WEBGPU_DEFAULT_MAX_TEXTURE_SIZE,
} from "./utils";
import { createReliefMaterial } from "./create-material";
import type { UniformRefs } from "./create-material";
import { getQualitySettings } from "../baked-relief/performance";
import {
  getOrLoadTexture,
  releaseTexture,
} from "../baked-relief/texture-cache";

// Re-export types for consumers
export type { BakedReliefProps, BakedTextures } from "./types";
export type { UniformRefs } from "./create-material";

// Lazy-load the WebGL fallback so it's only fetched when needed
const BakedReliefWebGL = lazy(() => import("../baked-relief"));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAMERA_FOV = 50;
const CAMERA_Z = 3;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

const MIN_MOVE_THRESHOLD = 0.001;
const TRAIL_INTERPOLATION_DENSITY = 30;

const PLAYHEAD_TIME_SCALE = 6;
const ANIMATION_DURATION_MS = 6_000;

const DEFAULT_CONTAINER_SIZE = 800;

// ---------------------------------------------------------------------------
// Trail controller — subset of Trail methods exposed for runtime updates
// ---------------------------------------------------------------------------

interface TrailController {
  setBaseSize: (s: number) => void;
  setFadeSpeed: (s: number) => void;
  setMaxAge: (a: number) => void;
  setIntensity: (i: number) => void;
  setAmbientIntensity: (i: number) => void;
  resetTime: () => void;
}

// ---------------------------------------------------------------------------
// Inner WebGPU implementation
// ---------------------------------------------------------------------------

interface BakedReliefWebGPUProps extends BakedReliefProps {
  onError?: () => void;
  maxTextureSize?: number;
}

function BakedReliefWebGPU({
  textures,
  textureScale = DEFAULT_TEXTURE_SCALE,
  textureStrength = DEFAULT_TEXTURE_STRENGTH,
  multiplyColor = DEFAULT_MULTIPLY_COLOR,
  trailSize = DEFAULT_TRAIL_SIZE,
  trailFadeSpeed = DEFAULT_TRAIL_FADE_SPEED,
  trailMaxAge = DEFAULT_TRAIL_MAX_AGE,
  trailIntensity = DEFAULT_TRAIL_INTENSITY,
  ambientIntensity = DEFAULT_AMBIENT_INTENSITY,
  mouseLerp = DEFAULT_MOUSE_LERP,
  mouseInfluence = DEFAULT_MOUSE_INFLUENCE,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  edgeFade = DEFAULT_EDGE_FADE,
  showDebugTrail = false,
  className = "",
  style,
  onError,
  maxTextureSize = WEBGPU_DEFAULT_MAX_TEXTURE_SIZE,
}: BakedReliefWebGPUProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const disposeRef = useRef<(() => void) | null>(null);
  const isVisibleRef = useRef(true);
  const wasVisibleRef = useRef(true);

  // Dynamic values that update without re-initializing the WebGPU pipeline
  const dynamicValuesRef = useRef({
    textureScale,
    textureStrength,
    multiplyColor,
    trailSize,
    trailFadeSpeed,
    trailMaxAge,
    trailIntensity,
    ambientIntensity,
    mouseLerp,
    mouseInfluence,
    rotationSpeed,
    edgeFade,
  });

  const trailRef = useRef<TrailController | null>(null);
  const uniformsRef = useRef<UniformRefs | null>(null);

  // -----------------------------------------------------------------------
  // Sync props → refs + live GPU objects (no pipeline re-init)
  // -----------------------------------------------------------------------
  useEffect(() => {
    dynamicValuesRef.current = {
      textureScale,
      textureStrength,
      multiplyColor,
      trailSize,
      trailFadeSpeed,
      trailMaxAge,
      trailIntensity,
      ambientIntensity,
      mouseLerp,
      mouseInfluence,
      rotationSpeed,
      edgeFade,
    };

    try {
      if (trailRef.current) {
        trailRef.current.setBaseSize(trailSize);
        trailRef.current.setFadeSpeed(trailFadeSpeed);
        trailRef.current.setMaxAge(trailMaxAge);
        trailRef.current.setIntensity(trailIntensity);
        trailRef.current.setAmbientIntensity(ambientIntensity);
      }
    } catch (e) {
      console.warn("Failed to update trail settings:", e);
    }

    try {
      if (uniformsRef.current) {
        const [mr, mg, mb] = parseHexColor(multiplyColor);
        uniformsRef.current.uMultiplyR.value = mr;
        uniformsRef.current.uMultiplyG.value = mg;
        uniformsRef.current.uMultiplyB.value = mb;
        uniformsRef.current.uTextureScale.value = textureScale;
        uniformsRef.current.uTextureStrength.value = textureStrength;
        uniformsRef.current.uEdgeFade.value = edgeFade;
      }
    } catch (e) {
      console.warn("Failed to update uniforms:", e);
    }
  }, [
    textureScale,
    textureStrength,
    multiplyColor,
    trailSize,
    trailFadeSpeed,
    trailMaxAge,
    trailIntensity,
    ambientIntensity,
    mouseLerp,
    mouseInfluence,
    rotationSpeed,
    edgeFade,
  ]);

  // -----------------------------------------------------------------------
  // Visibility tracking — pause rendering when off-screen
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? true;
        const wasVisible = wasVisibleRef.current;
        isVisibleRef.current = isVisible;
        wasVisibleRef.current = isVisible;

        if (isVisible && !wasVisible) {
          trailRef.current?.resetTime();
        }
      },
      { threshold: 0 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // -----------------------------------------------------------------------
  // Main WebGPU initialization
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    const initSketch = async (useReducedPixelRatio = false) => {
      try {
        const { ssam } = await import("ssam");
        const { Trail } = await import("./Trail");
        const THREE = await import("three");
        const {
          Color,
          Mesh,
          PerspectiveCamera,
          Scene,
          WebGPURenderer,
          PlaneGeometry,
        } = await import("three/webgpu");

        if (disposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || DEFAULT_CONTAINER_SIZE;
        const height = container.clientHeight || DEFAULT_CONTAINER_SIZE;

        // -- Determine pixel ratio --
        const quality = getQualitySettings();
        const desiredPixelRatio = Math.min(
          window.devicePixelRatio,
          quality.dpr[1]
        );
        const maxDimension = Math.max(width, height) * desiredPixelRatio;

        let pixelRatio: number;
        if (useReducedPixelRatio || maxDimension > maxTextureSize) {
          pixelRatio = calculateSafePixelRatio(
            width,
            height,
            desiredPixelRatio,
            maxTextureSize
          );
          console.info(
            `Using reduced pixel ratio ${pixelRatio.toFixed(2)} ` +
              `(was ${desiredPixelRatio.toFixed(2)}) — ` +
              `WebGPU limit ${maxTextureSize}px, ` +
              `original ${Math.round(maxDimension)}px`
          );
        } else {
          pixelRatio = desiredPixelRatio;
        }

        const visibilityRef = isVisibleRef;

        // ---- ssam sketch callback ----
        const sketch: Sketch<"webgpu"> = async ({
          wrap,
          canvas,
          width: w,
          height: h,
        }) => {
          // -- Renderer --
          canvas.style.width = "100%";
          canvas.style.height = "100%";

          const renderer = new WebGPURenderer({ canvas, antialias: false });
          renderer.setSize(w, h);
          renderer.setPixelRatio(pixelRatio);
          renderer.setClearColor(new Color(0x000000), 0);
          renderer.toneMapping = THREE.NoToneMapping;
          renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
          await renderer.init();

          if (disposed) {
            renderer.dispose();
            return;
          }

          // -- Camera & Scene --
          const camera = new PerspectiveCamera(
            CAMERA_FOV,
            w / h,
            CAMERA_NEAR,
            CAMERA_FAR
          );
          camera.position.set(0, 0, CAMERA_Z);
          camera.lookAt(0, 0, 0);

          const scene = new Scene();

          // -- Trail system --
          const trailRes = quality.trailResolution;
          const initialValues = dynamicValuesRef.current;
          const trail = new Trail(trailRes, trailRes, {
            baseSize: initialValues.trailSize,
            fadeSpeed: initialValues.trailFadeSpeed,
            maxAge: initialValues.trailMaxAge,
            intensity: initialValues.trailIntensity,
            gradientStops: quality.trailGradientStops,
            maxPoints: quality.maxTrailPoints,
            updateInterval: quality.trailUpdateInterval,
            ambientParticleCount: quality.ambientParticles,
          });
          trail.setAmbientIntensity(initialValues.ambientIntensity);
          trailRef.current = trail;

          if (showDebugTrail) {
            const debugCanvas = trail.getCanvas();
            Object.assign(debugCanvas.style, {
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: "1000",
              width: "120px",
              height: "120px",
              border: "1px solid #333",
              borderRadius: "4px",
              pointerEvents: "none",
            });
            container.appendChild(debugCanvas);
          }

          const trailTexture = new THREE.CanvasTexture(trail.getCanvas());
          trailTexture.minFilter = THREE.LinearFilter;
          trailTexture.magFilter = THREE.LinearFilter;

          // -- Load baked textures via shared cache --
          const textureUrls = [
            textures.bake1,
            textures.bake2,
            textures.bake3,
            textures.bake4,
            textures.bake5,
            textures.bake6,
          ];

          const bakePromises = textureUrls.map((url) => getOrLoadTexture(url));
          const plasterPromise = textures.plaster
            ? getOrLoadTexture(textures.plaster, true)
            : Promise.resolve(null);

          const [bakes, plasterTex] = await Promise.all([
            Promise.all(bakePromises),
            plasterPromise,
          ]);

          const [bake1, bake2, bake3, bake4, bake5, bake6] = bakes;

          if (disposed) {
            textureUrls.forEach((url) => releaseTexture(url));
            if (textures.plaster) releaseTexture(textures.plaster, true);
            renderer.dispose();
            return;
          }

          // Set colorSpace for bakes (linear data)
          bakes.forEach((t) => {
            t.colorSpace = THREE.NoColorSpace;
          });
          if (plasterTex) {
            plasterTex.wrapS = THREE.RepeatWrapping;
            plasterTex.wrapT = THREE.RepeatWrapping;
            plasterTex.colorSpace = THREE.NoColorSpace;
          }

          // -- Mouse tracking --
          const mouse = { x: 0.5, y: 0.5 };
          const targetMouse = { x: 0.5, y: 0.5 };
          const prevMouse = { x: 0.5, y: 0.5 };
          const clientCoords = { x: -1, y: -1 };

          // Cached bounding rect — updated on resize/scroll, not every frame
          let cachedRect: DOMRect | null = null;

          const updateRect = () => {
            cachedRect = canvas.getBoundingClientRect();
          };
          updateRect();

          const resizeObserver = new ResizeObserver(updateRect);
          resizeObserver.observe(canvas);

          // Update immediately on scroll — getBoundingClientRect() is cheap
          // inside a passive scroll handler (layout already computed).
          window.addEventListener("scroll", updateRect, { passive: true });

          const handleMouseMove = (e: MouseEvent) => {
            clientCoords.x = e.clientX;
            clientCoords.y = e.clientY;
          };

          const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            clientCoords.x = touch.clientX;
            clientCoords.y = touch.clientY;
          };

          const updateTargetFromClient = () => {
            if (clientCoords.x < 0 || !cachedRect || cachedRect.width === 0)
              return;
            targetMouse.x =
              (clientCoords.x - cachedRect.left) / cachedRect.width;
            targetMouse.y =
              1 - (clientCoords.y - cachedRect.top) / cachedRect.height;
          };

          window.addEventListener("mousemove", handleMouseMove, {
            passive: true,
          });
          window.addEventListener("touchmove", handleTouchMove, {
            passive: true,
          });

          // -- Material (TSL shader) --
          const { material, uniforms } = await createReliefMaterial({
            trailTexture,
            bakeTextures: [bake1, bake2, bake3, bake4, bake5, bake6],
            plasterTexture: plasterTex,
            multiplyColor: initialValues.multiplyColor,
            textureScale: initialValues.textureScale,
            textureStrength: initialValues.textureStrength,
            edgeFade: initialValues.edgeFade,
            blurSamples: quality.trailBlurSamples,
          });
          uniformsRef.current = uniforms;

          // -- Geometry sized to fill the camera frustum at z = 0 --
          const vFovRad = (CAMERA_FOV * Math.PI) / 180;
          const planeHeight = 2 * CAMERA_Z * Math.tan(vFovRad / 2);
          const planeWidth = planeHeight * (w / h);
          const geometry = new PlaneGeometry(planeWidth, planeHeight);

          const mesh = new Mesh(geometry, material);
          scene.add(mesh);

          let isUnloaded = false;

          // -- Render loop --
          wrap.render = ({ playhead }) => {
            if (disposed || isUnloaded) return;

            const time = playhead * PLAYHEAD_TIME_SCALE;
            const currentValues = dynamicValuesRef.current;

            updateTargetFromClient();

            mouse.x += (targetMouse.x - mouse.x) * currentValues.mouseLerp;
            mouse.y += (targetMouse.y - mouse.y) * currentValues.mouseLerp;

            const dx = mouse.x - prevMouse.x;
            const dy = mouse.y - prevMouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > MIN_MOVE_THRESHOLD) {
              const steps = Math.ceil(distance * TRAIL_INTERPOLATION_DENSITY);
              for (let i = 0; i < steps; i++) {
                const t = i / steps;
                trail.addPoint(prevMouse.x + dx * t, prevMouse.y + dy * t);
              }
            }

            prevMouse.x = mouse.x;
            prevMouse.y = mouse.y;

            trail.updateAmbient(time);
            const dirty = trail.update();
            if (dirty) {
              trailTexture.needsUpdate = true;
            }

            mesh.rotation.x = (mouse.y - 0.5) * currentValues.mouseInfluence;
            mesh.rotation.y =
              (mouse.x - 0.5) * currentValues.mouseInfluence +
              time * currentValues.rotationSpeed;

            try {
              renderer.render(scene, camera);
            } catch {
              isUnloaded = true;
            }
          };

          // -- Resize --
          wrap.resize = ({ width: newW, height: newH }) => {
            if (disposed || isUnloaded) return;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);

            const newPlaneWidth = planeHeight * (newW / newH);
            mesh.scale.set(newPlaneWidth / planeWidth, 1, 1);

            updateRect();
          };

          // -- Cleanup --
          wrap.unload = () => {
            isUnloaded = true;
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("scroll", updateRect);
            resizeObserver.disconnect();

            try {
              trail.destroy();
            } catch {
              /* trail may already be destroyed */
            }

            trailRef.current = null;
            uniformsRef.current = null;

            // Release cached textures
            textureUrls.forEach((url) => releaseTexture(url));
            if (textures.plaster) releaseTexture(textures.plaster, true);

            setTimeout(() => {
              try {
                renderer.dispose();
              } catch {
                /* safe to ignore during teardown */
              }
              try {
                geometry.dispose();
              } catch {
                /* safe to ignore during teardown */
              }
              try {
                material.dispose();
              } catch {
                /* safe to ignore during teardown */
              }
            }, 0);
          };
        };

        const settings: SketchSettings = {
          mode: "webgpu",
          dimensions: [width, height],
          pixelRatio,
          animate: true,
          duration: ANIMATION_DURATION_MS,
          playFps: quality.targetFps,
          parent: container,
          scaleToParent: false,
        };

        const result = await ssam(sketch as Sketch<"webgpu">, settings);

        const teardown = () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any)?.unloadCombined?.();
          } catch {
            /* safe to ignore during teardown */
          }
          try {
            result?.dispose?.();
          } catch {
            /* safe to ignore during teardown */
          }
        };

        if (disposed) {
          teardown();
        } else {
          disposeRef.current = teardown;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const isTextureSizeError =
          msg.includes("texture size") ||
          msg.includes("Texture size") ||
          msg.includes("exceeded maximum");

        if (!useReducedPixelRatio && isTextureSizeError) {
          console.warn(
            "WebGPU texture size exceeded, retrying with reduced pixel ratio…"
          );
          return initSketch(true);
        }

        console.error("WebGPU initialization failed:", error);
        if (!disposed && onError) onError();
      }
    };

    initSketch(false);

    return () => {
      disposed = true;
      trailRef.current = null;
      uniformsRef.current = null;
      if (disposeRef.current) {
        try {
          disposeRef.current();
        } catch (e) {
          console.warn("Error during WebGPU cleanup:", e);
        }
        disposeRef.current = null;
      }
    };
    // Only reinitialize when textures change, debug trail visibility, or max texture size.
    // Other settings are hot-updated via refs without reinitializing the pipeline.
    // onError is excluded — callers should wrap it in useCallback for stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures, showDebugTrail, maxTextureSize]);

  return (
    <div
      ref={containerRef}
      className={`relative *:origin-top-left ${className}`}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}

// ---------------------------------------------------------------------------
// Debug indicator
// ---------------------------------------------------------------------------

function RendererIndicator({ mode }: { mode: "webgpu" | "webgl" }) {
  const color = mode === "webgpu" ? "#00ff88" : "#ffaa00";
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 9999,
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: 600,
        color,
        background: "rgba(0, 0, 0, 0.7)",
        border: `1px solid ${color}`,
        pointerEvents: "none",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {mode}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component — WebGPU detection + automatic WebGL fallback
// ---------------------------------------------------------------------------

interface BakedReliefWithIndicatorProps extends BakedReliefProps {
  showRendererIndicator?: boolean;
}

export default function BakedRelief({
  showRendererIndicator = false,
  ...props
}: BakedReliefWithIndicatorProps) {
  const [renderMode, setRenderMode] = useState<"checking" | "webgpu" | "webgl">(
    "checking"
  );
  const [maxTextureSize, setMaxTextureSize] = useState<number>(
    WEBGPU_DEFAULT_MAX_TEXTURE_SIZE
  );

  useEffect(() => {
    let cancelled = false;

    checkWebGPUSupport().then((result) => {
      if (cancelled) return;
      if (result.supported) {
        setRenderMode("webgpu");
        if (result.maxTextureSize) {
          setMaxTextureSize(result.maxTextureSize);
        }
      } else {
        setRenderMode("webgl");
        console.info(
          "WebGPU not supported on this device, falling back to WebGL"
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleWebGPUError = useCallback(() => {
    console.warn(
      "WebGPU rendering failed at runtime, switching to WebGL fallback"
    );
    setRenderMode("webgl");
  }, []);

  if (renderMode === "checking") {
    return (
      <div
        className={`relative ${props.className ?? ""}`}
        style={{ width: "100%", height: "100%", ...props.style }}
      />
    );
  }

  if (renderMode === "webgl") {
    return (
      <div className="relative w-full h-full">
        {showRendererIndicator && <RendererIndicator mode="webgl" />}
        <Suspense
          fallback={
            <div
              className={`relative ${props.className ?? ""}`}
              style={{ width: "100%", height: "100%", ...props.style }}
            />
          }
        >
          <BakedReliefWebGL {...props} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {showRendererIndicator && <RendererIndicator mode="webgpu" />}
      <BakedReliefWebGPU
        {...props}
        onError={handleWebGPUError}
        maxTextureSize={maxTextureSize}
      />
    </div>
  );
}
