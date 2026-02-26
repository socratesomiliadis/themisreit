"use client";

import React, { useRef, useMemo, useEffect, useState, memo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import type { BakedReliefPlaneProps } from "./types";
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
import {
  getOrLoadTexture,
  releaseTexture,
  getTextureSync,
  createDummyTexture,
} from "./texture-cache";
import { Trail } from "./trail";
import { vertexShader, createFragmentShader } from "./shaders";
import { parseHexColor, calculatePlaneSize } from "./utils";
import { getQualitySettings, type QualitySettings } from "./performance";

// 1x1 black trail texture — used before the real trail is initialized.
let sharedDummyTrailTexture: THREE.DataTexture | null = null;
function getDummyTrailTexture(): THREE.DataTexture {
  if (!sharedDummyTrailTexture) {
    sharedDummyTrailTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    sharedDummyTrailTexture.needsUpdate = true;
  }
  return sharedDummyTrailTexture;
}

function BakedReliefPlaneInner({
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
  isVisible = true,
}: BakedReliefPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const trailRef = useRef<Trail | null>(null);
  const trailTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Mouse state kept in refs to avoid triggering re-renders each frame
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const prevMouseRef = useRef({ x: 0.5, y: 0.5 });
  const clientCoordsRef = useRef({ x: 0, y: 0 });

  // Cached bounding rect — updated only on resize / scroll (not every frame)
  const cachedRectRef = useRef<DOMRect | null>(null);

  // Per-instance scratch Vector2 to avoid allocating in the render loop
  const mouseVec2Ref = useRef(new THREE.Vector2(0.5, 0.5));

  const qualitySettings = useMemo(() => getQualitySettings(), []);
  const qualityRef = useRef<QualitySettings>(qualitySettings);

  const [trailReady, setTrailReady] = useState(false);
  const trailParamsRef = useRef({
    trailResolution,
    trailSize,
    trailFadeSpeed,
    trailMaxAge,
    trailIntensity,
  });

  trailParamsRef.current = {
    trailResolution,
    trailSize,
    trailFadeSpeed,
    trailMaxAge,
    trailIntensity,
  };

  const { viewport, size, gl } = useThree();

  // -------------------------------------------------------------------------
  // Cache canvas bounding rect — avoids per-frame getBoundingClientRect()
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const updateRect = () => {
      cachedRectRef.current = canvas.getBoundingClientRect();
    };
    updateRect();

    const observer = new ResizeObserver(updateRect);
    observer.observe(canvas);

    // Update immediately on scroll — getBoundingClientRect() is cheap inside
    // a passive scroll handler because layout has already been computed.
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, [gl]);

  // -------------------------------------------------------------------------
  // Deferred Trail initialization
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const createTrail = () => {
      if (cancelled) return;

      const params = trailParamsRef.current;
      const quality = qualityRef.current;
      const resolution = Math.min(
        params.trailResolution,
        quality.trailResolution
      );

      const trail = new Trail(resolution, resolution, {
        baseSize: params.trailSize,
        fadeSpeed: params.trailFadeSpeed,
        maxAge: params.trailMaxAge,
        intensity: params.trailIntensity,
        gradientStops: quality.trailGradientStops,
        maxPoints: quality.maxTrailPoints,
        updateInterval: quality.trailUpdateInterval,
        ambientParticleCount: quality.ambientParticles,
      });

      trailRef.current = trail;

      const tex = new THREE.CanvasTexture(trail.getCanvas());
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      trailTextureRef.current = tex;

      setTrailReady(true);
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(createTrail, { timeout: 300 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
        trailRef.current?.destroy();
        trailTextureRef.current?.dispose();
        trailTextureRef.current = null;
      };
    } else {
      const timer = setTimeout(createTrail, 50);
      return () => {
        cancelled = true;
        clearTimeout(timer);
        trailRef.current?.destroy();
        trailTextureRef.current?.dispose();
        trailTextureRef.current = null;
      };
    }
  }, [trailResolution]);

  // Update trail settings without recreating
  useEffect(() => {
    const trail = trailRef.current;
    if (trail) {
      trail.setBaseSize(trailSize);
      trail.setFadeSpeed(trailFadeSpeed);
      trail.setMaxAge(trailMaxAge);
      trail.setIntensity(trailIntensity);
    }
  }, [trailSize, trailFadeSpeed, trailMaxAge, trailIntensity]);

  // Memoize parsed colors
  const parsedFresnelColor = useMemo(
    () => parseHexColor(fresnelColor),
    [fresnelColor]
  );
  const parsedMultiplyColor = useMemo(
    () => parseHexColor(multiplyColor),
    [multiplyColor]
  );

  // Track texture loading state
  const [texturesReady, setTexturesReady] = useState(false);

  // Load textures using the global cache
  useEffect(() => {
    let cancelled = false;

    const loadPromises = [
      getOrLoadTexture(textures.bake1),
      getOrLoadTexture(textures.bake2),
      getOrLoadTexture(textures.bake3),
      getOrLoadTexture(textures.bake4),
      getOrLoadTexture(textures.bake5),
      getOrLoadTexture(textures.bake6),
      textures.plaster
        ? getOrLoadTexture(textures.plaster, true)
        : Promise.resolve(null),
      textures.grunge
        ? getOrLoadTexture(textures.grunge, true)
        : Promise.resolve(null),
    ];

    Promise.all(loadPromises).then(() => {
      if (!cancelled) {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(
            () => {
              if (!cancelled) setTexturesReady(true);
            },
            { timeout: 100 }
          );
        } else {
          requestAnimationFrame(() => {
            if (!cancelled) setTexturesReady(true);
          });
        }
      }
    });

    return () => {
      cancelled = true;
      releaseTexture(textures.bake1);
      releaseTexture(textures.bake2);
      releaseTexture(textures.bake3);
      releaseTexture(textures.bake4);
      releaseTexture(textures.bake5);
      releaseTexture(textures.bake6);
      if (textures.plaster) releaseTexture(textures.plaster, true);
      if (textures.grunge) releaseTexture(textures.grunge, true);
    };
  }, [textures]);

  // Get current textures from cache
  const loadedTextures = useMemo(() => {
    const whiteTex = createDummyTexture();
    return {
      bake1: getTextureSync(textures.bake1),
      bake2: getTextureSync(textures.bake2),
      bake3: getTextureSync(textures.bake3),
      bake4: getTextureSync(textures.bake4),
      bake5: getTextureSync(textures.bake5),
      bake6: getTextureSync(textures.bake6),
      plaster: textures.plaster
        ? getTextureSync(textures.plaster, true)
        : whiteTex,
      grunge: textures.grunge
        ? getTextureSync(textures.grunge, true)
        : whiteTex,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures, texturesReady]);

  // Create shader material — quality-tiered fragment shader
  const shaderMaterial = useMemo(() => {
    const quality = qualityRef.current;
    const fragmentShader = createFragmentShader(quality.trailBlurSamples);

    return new THREE.ShaderMaterial({
      uniforms: {
        tBake1: { value: null },
        tBake2: { value: null },
        tBake3: { value: null },
        tBake4: { value: null },
        tBake5: { value: null },
        tBake6: { value: null },
        tPlaster: { value: null },
        tTrail: { value: getDummyTrailTexture() },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTextureScale: { value: 1.0 },
        uTextureStrength: { value: 1.0 },
        uMultiplyColor: { value: new THREE.Color(1, 1, 1) },
        uFresnelEnabled: { value: 0.0 },
        uFresnelColor: { value: new THREE.Color(1, 1, 1) },
        uFresnelStrength: { value: 0.0 },
        uEdgeFade: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });
  }, []);

  // Update texture uniforms when loaded (no shader recompilation needed)
  useEffect(() => {
    const uniforms = shaderMaterial.uniforms;
    uniforms.tBake1.value = loadedTextures.bake1;
    uniforms.tBake2.value = loadedTextures.bake2;
    uniforms.tBake3.value = loadedTextures.bake3;
    uniforms.tBake4.value = loadedTextures.bake4;
    uniforms.tBake5.value = loadedTextures.bake5;
    uniforms.tBake6.value = loadedTextures.bake6;
    uniforms.tPlaster.value = loadedTextures.plaster;
  }, [shaderMaterial, loadedTextures]);

  // Cleanup shader material
  useEffect(() => {
    return () => shaderMaterial.dispose();
  }, [shaderMaterial]);

  // Update uniforms when props change
  useEffect(() => {
    const uniforms = shaderMaterial.uniforms;
    uniforms.uTextureScale.value = textureScale;
    uniforms.uTextureStrength.value = textureStrength;
    uniforms.uMultiplyColor.value = parsedMultiplyColor;
    uniforms.uFresnelEnabled.value = fresnelEnabled ? 1.0 : 0.0;
    uniforms.uFresnelColor.value = parsedFresnelColor;
    uniforms.uFresnelStrength.value = fresnelStrength;
    uniforms.uEdgeFade.value = edgeFade;
  }, [
    shaderMaterial,
    textureScale,
    textureStrength,
    parsedMultiplyColor,
    fresnelEnabled,
    parsedFresnelColor,
    fresnelStrength,
    edgeFade,
  ]);

  // Mouse handlers — passive listeners for performance
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      clientCoordsRef.current.x = e.clientX;
      clientCoordsRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      clientCoordsRef.current.x = touch.clientX;
      clientCoordsRef.current.y = touch.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Animation loop
  // -------------------------------------------------------------------------
  useFrame((state) => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    if (!material || !mesh || !isVisible) return;

    const trail = trailRef.current;

    // Map client coords to UV using cached rect (no reflow)
    const rect = cachedRectRef.current;
    if (rect && rect.width > 0) {
      targetMouseRef.current.x =
        (clientCoordsRef.current.x - rect.left) / rect.width;
      targetMouseRef.current.y =
        1 - (clientCoordsRef.current.y - rect.top) / rect.height;
    }

    // Smooth mouse following
    const mouse = mouseRef.current;
    const target = targetMouseRef.current;
    mouse.x += (target.x - mouse.x) * mouseLerp;
    mouse.y += (target.y - mouse.y) * mouseLerp;

    if (trail) {
      const prev = prevMouseRef.current;
      const dx = mouse.x - prev.x;
      const dy = mouse.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.001) {
        const steps = Math.ceil(distance * 30);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          trail.addPoint(prev.x + dx * t, prev.y + dy * t);
        }
      }

      prev.x = mouse.x;
      prev.y = mouse.y;

      trail.setAmbientIntensity(ambientIntensity);
      trail.updateAmbient(state.clock.elapsedTime);

      const dirty = trail.update();
      const tex = trailTextureRef.current;
      if (tex) {
        material.uniforms.tTrail.value = tex;
        if (dirty) {
          tex.needsUpdate = true;
        }
      }
    }

    material.uniforms.uTime.value = state.clock.elapsedTime;
    mouseVec2Ref.current.set(mouse.x, mouse.y);
    material.uniforms.uMouse.value.copy(mouseVec2Ref.current);

    mesh.rotation.x = (mouse.y - 0.5) * mouseInfluence;
    mesh.rotation.y =
      (mouse.x - 0.5) * mouseInfluence +
      state.clock.elapsedTime * rotationSpeed;
  });

  const planeSize = useMemo(
    () =>
      calculatePlaneSize(
        viewport.width,
        viewport.height,
        size.width,
        size.height,
        aspectRatio
      ),
    [viewport.width, viewport.height, size.width, size.height, aspectRatio]
  );

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeSize.width * 0.95, planeSize.height * 0.95]} />
      <primitive object={shaderMaterial} attach="material" ref={materialRef} />
    </mesh>
  );
}

export const BakedReliefPlane = memo(BakedReliefPlaneInner);
