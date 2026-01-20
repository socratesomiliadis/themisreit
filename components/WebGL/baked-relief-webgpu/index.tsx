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

import type { BakedReliefProps } from "./types";
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

// Re-export types
export type { BakedReliefProps, BakedTextures } from "./types";

// Import performance utilities from WebGL version
import { getQualitySettings } from "../baked-relief/performance";

// Lazy load the WebGL fallback
const BakedReliefWebGL = lazy(() => import("../baked-relief"));

// Detect Safari browser (including iOS Safari)
function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Safari but not Chrome (Chrome includes "Safari" in UA)
  const isSafariBrowser = /Safari/.test(ua) && !/Chrome/.test(ua);
  // iOS devices (Safari is the only real browser engine on iOS)
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  return isSafariBrowser || isIOS;
}

// Check if WebGPU is supported and reliable
async function isWebGPUSupported(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.gpu) {
    return false;
  }

  // Safari's WebGPU implementation has known issues with three.js
  // Force WebGL fallback on Safari until it's more stable
  if (isSafari()) {
    console.info("Safari detected - using WebGL for better compatibility");
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    // Try to get a device to confirm full support
    const device = await adapter.requestDevice();
    device.destroy();
    return true;
  } catch {
    return false;
  }
}

// WebGPU default device texture size limit
// Note: The adapter may support higher (e.g., 16384), but the default device
// created by three.js WebGPURenderer uses WebGPU's default limits (8192).
// To use higher limits, you'd need to pass requiredLimits when calling requestDevice(),
// but three.js doesn't do this, so we must respect the default limit.
const WEBGPU_DEFAULT_MAX_TEXTURE_SIZE = 8192;

// Calculate safe pixel ratio that won't exceed WebGPU texture limits
function calculateSafePixelRatio(
  width: number,
  height: number,
  desiredPixelRatio: number,
  maxTextureSize: number
): number {
  const maxDimension = Math.max(width, height);
  const maxSafePixelRatio = maxTextureSize / maxDimension;
  
  // Use the smaller of desired pixel ratio or the maximum safe ratio
  // Leave a small margin (0.95) to account for any rounding
  const safeRatio = Math.min(desiredPixelRatio, maxSafePixelRatio * 0.95);
  
  // Ensure we don't go below 1
  return Math.max(1, safeRatio);
}

// Parse hex color to RGB values (0-1 range)
function parseHexColor(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

// Inner WebGPU implementation component
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
}: BakedReliefProps & { onError?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const disposeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    const initSketch = async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const { ssam } = await import("ssam");
        const { Trail } = await import("./Trail");
        const THREE = await import("three");

        // WebGPU imports
        const {
          Color,
          Mesh,
          NodeMaterial,
          PerspectiveCamera,
          Scene,
          WebGPURenderer,
          PlaneGeometry,
          TextureLoader,
        } = await import("three/webgpu");

        const {
          Fn,
          vec4,
          vec3,
          vec2,
          mix,
          smoothstep,
          uniform,
          texture,
          uv,
          float,
          min: tslMin,
          pow: tslPow,
          mul,
          add,
          sub,
        } = await import("three/tsl");

        if (disposed) return;

        const container = containerRef.current!;
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 800;

        // Get quality settings for performance optimization
        const quality = getQualitySettings();

        // Calculate safe pixel ratio that respects WebGPU's default texture size limit
        const maxTextureSize = WEBGPU_DEFAULT_MAX_TEXTURE_SIZE;
        const desiredPixelRatio = Math.min(window.devicePixelRatio, quality.dpr[1]);
        const safePixelRatio = calculateSafePixelRatio(
          width,
          height,
          desiredPixelRatio,
          maxTextureSize
        );

        if (safePixelRatio < desiredPixelRatio) {
          console.info(
            `Reduced pixel ratio from ${desiredPixelRatio.toFixed(2)} to ${safePixelRatio.toFixed(2)} ` +
            `to fit within WebGPU max texture size (${maxTextureSize}px)`
          );
        }

        const sketch: Sketch<"webgpu"> = async ({
          wrap,
          canvas,
          width: w,
          height: h,
        }) => {
          // Use the pre-calculated safe pixel ratio that respects WebGPU texture limits
          const adjustedPixelRatio = safePixelRatio;

          const renderer = new WebGPURenderer({ canvas, antialias: false });
          renderer.setSize(w, h);
          renderer.setPixelRatio(adjustedPixelRatio);
          renderer.setClearColor(new Color(0x000000), 0);
          // Disable tone mapping and set linear output for accurate color multiplication
          renderer.toneMapping = THREE.NoToneMapping;
          renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
          await renderer.init();

          const camera = new PerspectiveCamera(50, w / h, 0.1, 100);
          camera.position.set(0, 0, 3);
          camera.lookAt(0, 0, 0);

          const scene = new Scene();

          // Trail setup with quality-based settings
          const trailRes = quality.trailResolution;
          const trail = new Trail(trailRes, trailRes, {
            baseSize: trailSize,
            fadeSpeed: trailFadeSpeed,
            maxAge: trailMaxAge,
            intensity: trailIntensity,
            gradientStops: quality.trailGradientStops,
            maxPoints: quality.maxTrailPoints,
            updateInterval: quality.trailUpdateInterval,
            ambientParticleCount: quality.ambientParticles,
          });
          trail.setAmbientIntensity(ambientIntensity);

          if (showDebugTrail) {
            const debugCanvas = trail.getCanvas();
            debugCanvas.style.position = "absolute";
            debugCanvas.style.top = "10px";
            debugCanvas.style.left = "10px";
            debugCanvas.style.zIndex = "1000";
            debugCanvas.style.width = "120px";
            debugCanvas.style.height = "120px";
            debugCanvas.style.border = "1px solid #333";
            debugCanvas.style.borderRadius = "4px";
            debugCanvas.style.pointerEvents = "none";
            container.appendChild(debugCanvas);
          }

          const trailTexture = new THREE.CanvasTexture(trail.getCanvas());
          trailTexture.minFilter = THREE.LinearFilter;
          trailTexture.magFilter = THREE.LinearFilter;

          // Load baked textures
          const loader = new TextureLoader();
          const loadTex = (url: string) =>
            new Promise<InstanceType<typeof THREE.Texture>>((resolve) => {
              loader.load(
                url,
                (tex) => {
                  // Use NoColorSpace to prevent automatic sRGB conversion
                  tex.colorSpace = THREE.NoColorSpace;
                  resolve(tex);
                },
                undefined,
                () => {
                  const dummy = new THREE.DataTexture(
                    new Uint8Array([128, 128, 128, 255]),
                    1,
                    1,
                    THREE.RGBAFormat
                  );
                  dummy.needsUpdate = true;
                  resolve(dummy);
                }
              );
            });

          const [bake1, bake2, bake3, bake4, bake5, bake6, plasterTex] =
            await Promise.all([
              loadTex(textures.bake1),
              loadTex(textures.bake2),
              loadTex(textures.bake3),
              loadTex(textures.bake4),
              loadTex(textures.bake5),
              loadTex(textures.bake6),
              textures.plaster
                ? loadTex(textures.plaster).then((t) => {
                    t.wrapS = THREE.RepeatWrapping;
                    t.wrapT = THREE.RepeatWrapping;
                    t.colorSpace = THREE.NoColorSpace;
                    return t;
                  })
                : Promise.resolve(null),
            ]);

          // Mouse tracking - store client coords and recalculate on each frame
          // This ensures scroll position changes are accounted for
          const mouse = { x: 0.5, y: 0.5 };
          const targetMouse = { x: 0.5, y: 0.5 };
          const prevMouse = { x: 0.5, y: 0.5 };
          const clientCoords = { x: -1, y: -1 }; // -1 means no mouse position yet

          const handleMouseMove = (e: MouseEvent) => {
            clientCoords.x = e.clientX;
            clientCoords.y = e.clientY;
          };

          const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            clientCoords.x = touch.clientX;
            clientCoords.y = touch.clientY;
          };

          // Update target mouse position from client coords (called in render loop)
          const updateTargetMouse = () => {
            if (clientCoords.x < 0) return; // No mouse position yet
            const rect = canvas.getBoundingClientRect();
            targetMouse.x = (clientCoords.x - rect.left) / rect.width;
            targetMouse.y = 1 - (clientCoords.y - rect.top) / rect.height;
          };

          window.addEventListener("mousemove", handleMouseMove, {
            passive: true,
          });
          window.addEventListener("touchmove", handleTouchMove, {
            passive: true,
          });

          // Uniforms - multiply color as individual components
          const [mr, mg, mb] = parseHexColor(multiplyColor);
          const uMultiplyR = uniform(mr);
          const uMultiplyG = uniform(mg);
          const uMultiplyB = uniform(mb);
          const uTextureScale = uniform(textureScale);
          const uTextureStrength = uniform(textureStrength);
          const uEdgeFade = uniform(edgeFade);

          // Create plane geometry
          const planeSize = (Math.min(w, h) / h) * 2.5;
          const geometry = new PlaneGeometry(planeSize, planeSize);

          // Create material with TSL
          const material = new NodeMaterial();

          material.colorNode = Fn(() => {
            const vuv = uv();

            // Sample trail with slight blur
            const texelSize = float(1.0 / 512.0);
            let rawTrail = mul(texture(trailTexture, vuv).r, 0.4);
            rawTrail = add(
              rawTrail,
              mul(texture(trailTexture, add(vuv, vec2(texelSize, 0))).r, 0.15)
            );
            rawTrail = add(
              rawTrail,
              mul(texture(trailTexture, sub(vuv, vec2(texelSize, 0))).r, 0.15)
            );
            rawTrail = add(
              rawTrail,
              mul(texture(trailTexture, add(vuv, vec2(0, texelSize))).r, 0.15)
            );
            rawTrail = add(
              rawTrail,
              mul(texture(trailTexture, sub(vuv, vec2(0, texelSize))).r, 0.15)
            );

            // Apply feathering
            const trailSmooth = mul(
              smoothstep(0, 0.3, rawTrail),
              smoothstep(0, 1, rawTrail)
            );
            const trailValue = tslPow(trailSmooth, 0.7);

            // Sample baked textures
            const b1 = texture(bake1, vuv);
            const b2 = texture(bake2, vuv);
            const b3 = texture(bake3, vuv);
            const b4 = texture(bake4, vuv);
            const b5 = texture(bake5, vuv);
            const b6 = texture(bake6, vuv);

            // Progressive blend through textures based on trail
            const t = mul(trailValue, 5.0);

            // Blend through 6 levels
            let color = mix(b1, b2, smoothstep(0, 1, t));
            color = mix(color, b3, smoothstep(1, 2, t));
            color = mix(color, b4, smoothstep(2, 3, t));
            color = mix(color, b5, smoothstep(3, 4, t));
            color = mix(color, b6, smoothstep(4, 5, t));

            // Apply multiply color - component-wise multiplication
            let finalR = mul(color.r, uMultiplyR);
            let finalG = mul(color.g, uMultiplyG);
            let finalB = mul(color.b, uMultiplyB);

            // Apply plaster texture if available
            if (plasterTex) {
              const plasterUV = mul(vuv, uTextureScale);
              const plasterSample = texture(plasterTex, plasterUV);
              const plasterMixR = mix(
                float(1.0),
                plasterSample.r,
                uTextureStrength
              );
              const plasterMixG = mix(
                float(1.0),
                plasterSample.g,
                uTextureStrength
              );
              const plasterMixB = mix(
                float(1.0),
                plasterSample.b,
                uTextureStrength
              );
              finalR = mul(finalR, plasterMixR);
              finalG = mul(finalG, plasterMixG);
              finalB = mul(finalB, plasterMixB);
            }

            const finalColor = vec3(finalR, finalG, finalB);

            // Edge fade/vignette
            const edgeDistX = tslMin(vuv.x, sub(1, vuv.x));
            const edgeDistY = tslMin(vuv.y, sub(1, vuv.y));
            const fadeX = smoothstep(0, uEdgeFade, edgeDistX);
            const fadeY = smoothstep(0, uEdgeFade, edgeDistY);
            const edgeAlpha = mul(fadeX, fadeY);

            return vec4(finalColor, mul(color.a, edgeAlpha));
          })();

          material.transparent = true;

          const mesh = new Mesh(geometry, material);
          scene.add(mesh);

          // Render loop
          wrap.render = ({ playhead }) => {
            const time = playhead * 6;

            // Update target mouse from client coords (handles scroll)
            updateTargetMouse();

            // Smooth mouse following
            mouse.x += (targetMouse.x - mouse.x) * mouseLerp;
            mouse.y += (targetMouse.y - mouse.y) * mouseLerp;

            // Add points to trail
            const dx = mouse.x - prevMouse.x;
            const dy = mouse.y - prevMouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0.001) {
              const steps = Math.ceil(distance * 30);
              for (let i = 0; i < steps; i++) {
                const t = i / steps;
                trail.addPoint(prevMouse.x + dx * t, prevMouse.y + dy * t);
              }
            }

            prevMouse.x = mouse.x;
            prevMouse.y = mouse.y;

            // Update ambient trails
            trail.updateAmbient(time);
            trail.update();
            trailTexture.needsUpdate = true;

            // Subtle rotation
            mesh.rotation.x = (mouse.y - 0.5) * mouseInfluence;
            mesh.rotation.y =
              (mouse.x - 0.5) * mouseInfluence + time * rotationSpeed;

            renderer.render(scene, camera);
          };

          wrap.resize = ({ width: newW, height: newH }) => {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          };

          wrap.unload = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            trail.destroy();
            renderer.dispose();
            geometry.dispose();
            material.dispose();
          };
        };

        const settings: SketchSettings = {
          mode: "webgpu",
          dimensions: [width, height],
          pixelRatio: safePixelRatio,
          animate: true,
          duration: 6_000,
          playFps: quality.targetFps,
          parent: container,
        };

        const result = await ssam(sketch as Sketch<"webgpu">, settings);
        const dispose = result?.dispose ?? (() => {});
        if (disposed) {
          dispose();
        } else {
          disposeRef.current = dispose;
        }
      } catch (error) {
        console.error(
          "WebGPU initialization failed, triggering fallback:",
          error
        );
        if (!disposed && onError) {
          onError();
        }
      }
    };

    initSketch();

    return () => {
      disposed = true;
      if (disposeRef.current) {
        disposeRef.current();
        disposeRef.current = null;
      }
    };
  }, [
    textures,
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
    showDebugTrail,
    onError,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
}

// Debug indicator component
function RendererIndicator({ mode }: { mode: "webgpu" | "webgl" }) {
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
        color: mode === "webgpu" ? "#00ff88" : "#ffaa00",
        background: "rgba(0, 0, 0, 0.7)",
        border: `1px solid ${mode === "webgpu" ? "#00ff88" : "#ffaa00"}`,
        pointerEvents: "none",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {mode}
    </div>
  );
}

// Extended props with indicator option
interface BakedReliefWithIndicatorProps extends BakedReliefProps {
  /** Show a debug indicator for which renderer is being used (default: false) */
  showRendererIndicator?: boolean;
}

// Main export with WebGPU detection and WebGL fallback
export default function BakedRelief({
  showRendererIndicator = false,
  ...props
}: BakedReliefWithIndicatorProps) {
  const [renderMode, setRenderMode] = useState<"checking" | "webgpu" | "webgl">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;

    isWebGPUSupported().then((supported) => {
      if (cancelled) return;
      setRenderMode(supported ? "webgpu" : "webgl");
      if (!supported) {
        console.info(
          "WebGPU not supported on this device, falling back to WebGL"
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Callback when WebGPU initialization fails at runtime
  const handleWebGPUError = useCallback(() => {
    console.warn(
      "WebGPU rendering failed at runtime, switching to WebGL fallback"
    );
    setRenderMode("webgl");
  }, []);

  // Show nothing while checking support
  if (renderMode === "checking") {
    return (
      <div
        className={`relative ${props.className ?? ""}`}
        style={{
          width: "100%",
          height: "100%",
          ...props.style,
        }}
      />
    );
  }

  // Fallback to WebGL version
  if (renderMode === "webgl") {
    return (
      <div className="relative w-full h-full">
        {showRendererIndicator && <RendererIndicator mode="webgl" />}
        <Suspense
          fallback={
            <div
              className={`relative ${props.className ?? ""}`}
              style={{
                width: "100%",
                height: "100%",
                ...props.style,
              }}
            />
          }
        >
          <BakedReliefWebGL {...props} />
        </Suspense>
      </div>
    );
  }

  // Use WebGPU version with error fallback
  return (
    <div className="relative w-full h-full">
      {showRendererIndicator && <RendererIndicator mode="webgpu" />}
      <BakedReliefWebGPU {...props} onError={handleWebGPUError} />
    </div>
  );
}
