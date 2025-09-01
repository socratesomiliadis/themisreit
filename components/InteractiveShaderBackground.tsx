"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { vertexShader, fluidShader, displayShader } from "@/lib/shaders";

interface ShaderConfig {
  brushSize: number;
  brushStrength: number;
  distortionAmount: number;
  fluidDecay: number;
  trailLength: number;
  stopDecay: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  colorIntensity: number;
  softness: number;
}

interface InteractiveShaderBackgroundProps {
  className?: string;
  config?: Partial<ShaderConfig>;
}

const defaultConfig: ShaderConfig = {
  brushSize: 25.0,
  brushStrength: 0.5,
  distortionAmount: 2.5,
  fluidDecay: 0.98,
  trailLength: 0.8,
  stopDecay: 0.85,
  color1: "#000000",
  color2: "#000000",
  color3: "#252525",
  color4: "#000000",
  colorIntensity: 1.0,
  softness: 1.0,
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function InteractiveShaderBackground({
  className = "",
  config: userConfig = {},
}: InteractiveShaderBackgroundProps) {
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

  const config = { ...defaultConfig, ...userConfig };

  const initThreeJS = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { clientWidth: width, clientHeight: height } = container;

    // Camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Render targets
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

    // Materials
    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize: { value: config.brushSize },
        uBrushStrength: { value: config.brushStrength },
        uFluidDecay: { value: config.fluidDecay },
        uTrailLength: { value: config.trailLength },
        uStopDecay: { value: config.stopDecay },
      },
      vertexShader,
      fragmentShader: fluidShader,
    });
    fluidMaterialRef.current = fluidMaterial;

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iFluid: { value: null },
        uDistortionAmount: { value: config.distortionAmount },
        uColor1: { value: new THREE.Vector3(...hexToRgb(config.color1)) },
        uColor2: { value: new THREE.Vector3(...hexToRgb(config.color2)) },
        uColor3: { value: new THREE.Vector3(...hexToRgb(config.color3)) },
        uColor4: { value: new THREE.Vector3(...hexToRgb(config.color4)) },
        uColorIntensity: { value: config.colorIntensity },
        uSoftness: { value: config.softness },
      },
      vertexShader,
      fragmentShader: displayShader,
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
  }, [config]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !fluidMaterialRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = mouseRef.current;

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX - rect.left;
    mouse.y = rect.height - (e.clientY - rect.top);
    mouse.lastMoveTime = performance.now();

    fluidMaterialRef.current.uniforms.iMouse.value.set(
      mouse.x,
      mouse.y,
      mouse.prevX,
      mouse.prevY
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!fluidMaterialRef.current) return;
    fluidMaterialRef.current.uniforms.iMouse.value.set(0, 0, 0, 0);
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
      !previousFluidTargetRef.current
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
    fluidMaterialRef.current.uniforms.uBrushSize.value = config.brushSize;
    fluidMaterialRef.current.uniforms.uBrushStrength.value =
      config.brushStrength;
    fluidMaterialRef.current.uniforms.uFluidDecay.value = config.fluidDecay;
    fluidMaterialRef.current.uniforms.uTrailLength.value = config.trailLength;
    fluidMaterialRef.current.uniforms.uStopDecay.value = config.stopDecay;

    displayMaterialRef.current.uniforms.uDistortionAmount.value =
      config.distortionAmount;
    displayMaterialRef.current.uniforms.uColorIntensity.value =
      config.colorIntensity;
    displayMaterialRef.current.uniforms.uSoftness.value = config.softness;
    displayMaterialRef.current.uniforms.uColor1.value.set(
      ...hexToRgb(config.color1)
    );
    displayMaterialRef.current.uniforms.uColor2.value.set(
      ...hexToRgb(config.color2)
    );
    displayMaterialRef.current.uniforms.uColor3.value.set(
      ...hexToRgb(config.color3)
    );
    displayMaterialRef.current.uniforms.uColor4.value.set(
      ...hexToRgb(config.color4)
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
    rendererRef.current.render(displayPlaneRef.current, cameraRef.current);

    // Swap render targets
    const temp = currentFluidTargetRef.current;
    currentFluidTargetRef.current = previousFluidTargetRef.current;
    previousFluidTargetRef.current = temp;

    frameCountRef.current++;
    animationIdRef.current = requestAnimationFrame(animate);
  }, [config]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !rendererRef.current) return;

    const { clientWidth: width, clientHeight: height } = containerRef.current;

    rendererRef.current.setSize(width, height);

    if (fluidMaterialRef.current) {
      fluidMaterialRef.current.uniforms.iResolution.value.set(width, height);
    }
    if (displayMaterialRef.current) {
      displayMaterialRef.current.uniforms.iResolution.value.set(width, height);
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

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
