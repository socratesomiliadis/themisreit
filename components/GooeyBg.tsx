/**
 * GooeyBg - Interactive WebGL Shader Background Component
 *
 * Creates a particle field with cross/diamond shapes that appear through a gooey mask
 * that follows mouse movement. Based on the halftone effect from the provided image.
 *
 * Features:
 * - Cross/diamond particle pattern with randomized positions and sizes
 * - Organic gooey mask that follows mouse movement
 * - Smooth particle reveal effect with customizable colors
 * - Full WebGL hardware acceleration
 * - Responsive and touch-friendly
 *
 * Usage:
 * ```tsx
 * import GooeyBg from "@/components/GooeyBg";
 *
 * function MyComponent() {
 *   return (
 *     <div className="relative w-full h-screen">
 *       <GooeyBg
 *         className="absolute inset-0 z-0"
 *         particleSize={0.02}
 *         maskIntensity={2.0}
 *         backgroundColor="#000000"
 *         particleColor="#666666"
 *         brushSize={200}
 *         brushStrength={0.7}
 *       />
 *       <div className="relative z-10">
 *         Your content here
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { vertexShader, fluidShader, gooeyParticleShader } from "@/lib/shaders";

interface GooeyBgProps {
  /** Additional CSS classes for the container */
  className?: string;
  /** Size of individual particles (0.01 - 0.05 recommended) */
  particleSize?: number;
  /** Intensity of the fluid mask effect (0.5 - 3.0 recommended) */
  maskIntensity?: number;
  /** Background color in hex format */
  backgroundColor?: string;
  /** Particle color in hex format */
  particleColor?: string;
  /** Brush size for fluid interaction (100 - 500 recommended) */
  brushSize?: number;
  /** Brush strength for fluid interaction (0.1 - 1.0 recommended) */
  brushStrength?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function GooeyBg({
  className = "",
  particleSize = 0.02,
  maskIntensity = 2.0,
  backgroundColor = "#000000",
  particleColor = "#666666",
  brushSize = 300.0,
  brushStrength = 0.5,
}: GooeyBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const fluidTarget1Ref = useRef<THREE.WebGLRenderTarget | null>(null);
  const fluidTarget2Ref = useRef<THREE.WebGLRenderTarget | null>(null);
  const currentFluidTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const previousFluidTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const fluidMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const displayMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const fluidPlaneRef = useRef<THREE.Mesh | null>(null);
  const displayPlaneRef = useRef<THREE.Mesh | null>(null);
  const frameCountRef = useRef(0);
  const animationIdRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, lastMoveTime: 0 });

  const initThreeJS = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { clientWidth: width, clientHeight: height } = container;

    // Camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Render targets for fluid simulation
    const fluidTarget1 = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    fluidTarget1Ref.current = fluidTarget1;

    const fluidTarget2 = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    fluidTarget2Ref.current = fluidTarget2;

    currentFluidTargetRef.current = fluidTarget1;
    previousFluidTargetRef.current = fluidTarget2;

    // Fluid simulation material
    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize: { value: brushSize },
        uBrushStrength: { value: brushStrength },
        uFluidDecay: { value: 0.98 },
        uTrailLength: { value: 0.8 },
        uStopDecay: { value: 0.85 },
      },
      vertexShader,
      fragmentShader: fluidShader,
    });
    fluidMaterialRef.current = fluidMaterial;

    // Display material for particles
    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iFluid: { value: null },
        iMouse: { value: new THREE.Vector2(width / 2, height / 2) },
        uParticleSize: { value: particleSize },
        uMaskIntensity: { value: maskIntensity },
        uBackgroundColor: {
          value: new THREE.Vector3(...hexToRgb(backgroundColor)),
        },
        uParticleColor: {
          value: new THREE.Vector3(...hexToRgb(particleColor)),
        },
      },
      vertexShader,
      fragmentShader: gooeyParticleShader,
      transparent: true,
    });
    displayMaterialRef.current = displayMaterial;

    // Geometry and meshes
    const geometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(geometry, displayMaterial);
    fluidPlaneRef.current = fluidPlane;
    displayPlaneRef.current = displayPlane;

    // Scene
    const scene = new THREE.Scene();
    scene.add(displayPlane);
    sceneRef.current = scene;

    frameCountRef.current = 0;
  }, [
    particleSize,
    maskIntensity,
    backgroundColor,
    particleColor,
    brushSize,
    brushStrength,
  ]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (
      !containerRef.current ||
      !fluidMaterialRef.current ||
      !displayMaterialRef.current
    )
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = mouseRef.current;

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX - rect.left;
    mouse.y = rect.height - (e.clientY - rect.top);
    mouse.lastMoveTime = performance.now();

    // Update fluid material (for simulation)
    fluidMaterialRef.current.uniforms.iMouse.value.set(
      mouse.x,
      mouse.y,
      mouse.prevX,
      mouse.prevY
    );

    // Update display material (for distance fade effect)
    displayMaterialRef.current.uniforms.iMouse.value.set(mouse.x, mouse.y);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!fluidMaterialRef.current || !displayMaterialRef.current) return;
    fluidMaterialRef.current.uniforms.iMouse.value.set(0, 0, 0, 0);
    // Keep display mouse position for fade effect even when not hovering
  }, []);

  const animate = useCallback(() => {
    if (
      !rendererRef.current ||
      !cameraRef.current ||
      !fluidMaterialRef.current ||
      !displayMaterialRef.current ||
      !fluidPlaneRef.current ||
      !displayPlaneRef.current ||
      !currentFluidTargetRef.current ||
      !previousFluidTargetRef.current ||
      !sceneRef.current
    ) {
      return;
    }

    const time = performance.now() * 0.001;
    const mouse = mouseRef.current;

    // Update uniforms
    fluidMaterialRef.current.uniforms.iTime.value = time;
    displayMaterialRef.current.uniforms.iTime.value = time;
    fluidMaterialRef.current.uniforms.iFrame.value = frameCountRef.current;

    // Check if mouse has stopped moving
    if (performance.now() - mouse.lastMoveTime > 100) {
      fluidMaterialRef.current.uniforms.iMouse.value.set(0, 0, 0, 0);
    }

    // Update config uniforms
    fluidMaterialRef.current.uniforms.uBrushSize.value = brushSize;
    fluidMaterialRef.current.uniforms.uBrushStrength.value = brushStrength;

    displayMaterialRef.current.uniforms.uParticleSize.value = particleSize;
    displayMaterialRef.current.uniforms.uMaskIntensity.value = maskIntensity;
    displayMaterialRef.current.uniforms.uBackgroundColor.value.set(
      ...hexToRgb(backgroundColor)
    );
    displayMaterialRef.current.uniforms.uParticleColor.value.set(
      ...hexToRgb(particleColor)
    );

    // Render fluid simulation
    fluidMaterialRef.current.uniforms.iPreviousFrame.value =
      previousFluidTargetRef.current.texture;
    rendererRef.current.setRenderTarget(currentFluidTargetRef.current);
    rendererRef.current.render(fluidPlaneRef.current, cameraRef.current);

    // Render display
    displayMaterialRef.current.uniforms.iFluid.value =
      currentFluidTargetRef.current.texture;
    rendererRef.current.setRenderTarget(null);
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // Swap render targets
    const temp = currentFluidTargetRef.current;
    currentFluidTargetRef.current = previousFluidTargetRef.current;
    previousFluidTargetRef.current = temp;

    frameCountRef.current++;
    animationIdRef.current = requestAnimationFrame(animate);
  }, [
    particleSize,
    maskIntensity,
    backgroundColor,
    particleColor,
    brushSize,
    brushStrength,
  ]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !rendererRef.current) return;

    const { clientWidth: width, clientHeight: height } = containerRef.current;

    rendererRef.current.setSize(width, height);

    if (fluidMaterialRef.current) {
      fluidMaterialRef.current.uniforms.iResolution.value.set(width, height);
    }
    if (displayMaterialRef.current) {
      displayMaterialRef.current.uniforms.iResolution.value.set(width, height);
      // Reset mouse position to center on resize
      displayMaterialRef.current.uniforms.iMouse.value.set(
        width / 2,
        height / 2
      );
    }

    if (fluidTarget1Ref.current && fluidTarget2Ref.current) {
      fluidTarget1Ref.current.setSize(width, height);
      fluidTarget2Ref.current.setSize(width, height);
    }

    frameCountRef.current = 0;
  }, []);

  useEffect(() => {
    initThreeJS();

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Start animation
    animate();

    return () => {
      // Cleanup
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      // Dispose Three.js objects
      if (rendererRef.current) {
        if (
          containerRef.current &&
          rendererRef.current.domElement.parentNode === containerRef.current
        ) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }

      if (fluidTarget1Ref.current) fluidTarget1Ref.current.dispose();
      if (fluidTarget2Ref.current) fluidTarget2Ref.current.dispose();
      if (fluidMaterialRef.current) fluidMaterialRef.current.dispose();
      if (displayMaterialRef.current) displayMaterialRef.current.dispose();
    };
  }, [initThreeJS, handleMouseMove, handleMouseLeave, handleResize, animate]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${className}`}
      style={{
        cursor: "none",
        background: backgroundColor,
      }}
    />
  );
}
