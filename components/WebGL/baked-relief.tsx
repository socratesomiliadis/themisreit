"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Baked Relief Component
 *
 * Creates the davincii.com effect using ONLY images - no 3D model needed!
 * The 3D effect comes from baked lighting/shadows in the textures.
 *
 * Uses 6 baked images that blend from flat/invisible to fully revealed
 * as you draw with the mouse trail.
 */

// ============================================================================
// GLOBAL TEXTURE CACHE - Shared across ALL BakedRelief instances
// ============================================================================
interface CachedTexture {
  texture: THREE.Texture;
  refCount: number;
  loading: boolean;
  promise: Promise<THREE.Texture>;
}

const textureCache = new Map<string, CachedTexture>();
const textureLoader = new THREE.TextureLoader();

function getOrLoadTexture(url: string, repeat = false): Promise<THREE.Texture> {
  const cacheKey = `${url}:${repeat}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    cached.refCount++;
    return cached.promise;
  }

  const promise = new Promise<THREE.Texture>((resolve) => {
    // Use requestIdleCallback to defer texture loading when browser is idle
    const load = () => {
      textureLoader.load(
        url,
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
          tex.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

          const entry = textureCache.get(cacheKey);
          if (entry) {
            entry.texture = tex;
            entry.loading = false;
          }
          resolve(tex);
        },
        undefined,
        () => {
          // On error, resolve with a dummy texture
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
    };

    // Defer loading to prevent blocking
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(load, { timeout: 200 });
    } else {
      setTimeout(load, 0);
    }
  });

  // Create placeholder texture immediately
  const placeholder = new THREE.DataTexture(
    new Uint8Array([32, 32, 32, 255]),
    1,
    1,
    THREE.RGBAFormat
  );
  placeholder.needsUpdate = true;

  textureCache.set(cacheKey, {
    texture: placeholder,
    refCount: 1,
    loading: true,
    promise,
  });

  return promise;
}

function releaseTexture(url: string, repeat = false) {
  const cacheKey = `${url}:${repeat}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    cached.refCount--;
    if (cached.refCount <= 0) {
      cached.texture.dispose();
      textureCache.delete(cacheKey);
    }
  }
}

function getTextureSync(url: string, repeat = false): THREE.Texture {
  const cacheKey = `${url}:${repeat}`;
  const cached = textureCache.get(cacheKey);
  return cached?.texture ?? createDummyTexture();
}

function createDummyTexture(): THREE.Texture {
  const tex = new THREE.DataTexture(
    new Uint8Array([32, 32, 32, 255]),
    1,
    1,
    THREE.RGBAFormat
  );
  tex.needsUpdate = true;
  return tex;
}

// ============================================================================
// TRAIL CLASS
// ============================================================================

/**
 * Trail class - Canvas-based mouse trail texture
 * Lower intensity for gradual reveal through 6 textures
 * Frame-rate independent fade using delta time
 * Includes ambient trails that animate independently of mouse
 */
class Trail {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private width: number;
  private height: number;
  private points: Array<{ x: number; y: number; age: number; size: number }>;
  private maxAge: number;
  private baseSize: number;
  private fadeSpeed: number;
  private intensity: number;
  private lastTime: number;
  private targetFPS: number = 60; // Reference frame rate for fade calculations

  // Ambient trail system
  private ambientParticles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    phase: number;
    speed: number;
  }> = [];
  private ambientIntensity: number = 0;

  constructor(
    width: number = 512,
    height: number = 512,
    options: {
      maxAge?: number;
      baseSize?: number;
      fadeSpeed?: number;
      intensity?: number;
    } = {}
  ) {
    this.width = width;
    this.height = height;
    this.maxAge = options.maxAge ?? 120;
    this.baseSize = options.baseSize ?? 0.15;
    this.fadeSpeed = options.fadeSpeed ?? 0.985;
    // Lower intensity = more gradual reveal through all 6 textures
    this.intensity = options.intensity ?? 0.15;
    this.points = [];
    this.lastTime = performance.now();

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d")!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    // Initialize ambient particles with random positions and velocities
    // Use fewer particles for better performance
    this.initAmbientParticles(3);

    this.clear();
  }

  private initAmbientParticles(count: number) {
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
  }

  setAmbientIntensity(intensity: number) {
    this.ambientIntensity = intensity;
  }

  setBaseSize(size: number) {
    this.baseSize = size;
  }

  setFadeSpeed(speed: number) {
    this.fadeSpeed = speed;
  }

  setMaxAge(age: number) {
    this.maxAge = age;
  }

  setIntensity(intensity: number) {
    this.intensity = intensity;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  addPoint(x: number, y: number) {
    this.points.push({
      x: x * this.width,
      y: (1 - y) * this.height,
      age: 0,
      size: this.baseSize * this.width,
    });
  }

  // Update ambient particles and add their trails
  updateAmbient(time: number) {
    if (this.ambientIntensity <= 0) return;

    for (const particle of this.ambientParticles) {
      // Organic movement using sine waves
      const wobbleX = Math.sin(time * particle.speed + particle.phase) * 0.003;
      const wobbleY =
        Math.cos(time * particle.speed * 0.7 + particle.phase) * 0.003;

      particle.x += particle.vx + wobbleX;
      particle.y += particle.vy + wobbleY;

      // Soft boundary bounce
      if (particle.x < 0.1 || particle.x > 0.9) {
        particle.vx *= -1;
        particle.x = Math.max(0.1, Math.min(0.9, particle.x));
      }
      if (particle.y < 0.1 || particle.y > 0.9) {
        particle.vy *= -1;
        particle.y = Math.max(0.1, Math.min(0.9, particle.y));
      }

      // Add trail point with reduced intensity
      if (Math.random() < this.ambientIntensity) {
        this.points.push({
          x: particle.x * this.width,
          y: (1 - particle.y) * this.height,
          age: 0,
          size: this.baseSize * this.width * 0.7, // Slightly smaller than mouse trails
        });
      }
    }
  }

  update() {
    // Calculate delta time for frame-rate independent fade
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;

    // Calculate how many "60fps frames" worth of time has passed
    // This makes the fade consistent regardless of actual frame rate
    const frameMultiplier = deltaTime * this.targetFPS;

    // Apply fade - use power to make it frame-rate independent
    // fadeSpeed^frameMultiplier gives consistent fade over time
    const adjustedFade = Math.pow(this.fadeSpeed, frameMultiplier);

    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - adjustedFade})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Use "lighter" to accumulate, but with much lower opacity
    this.ctx.globalCompositeOperation = "lighter";

    for (let i = this.points.length - 1; i >= 0; i--) {
      const point = this.points[i];
      // Frame-rate independent aging
      point.age += frameMultiplier;

      if (point.age > this.maxAge) {
        this.points.splice(i, 1);
        continue;
      }

      const lifeRatio = 1 - point.age / this.maxAge;
      // Much lower base opacity for gradual buildup
      const opacity = lifeRatio * lifeRatio * this.intensity;
      const sizeMultiplier = Math.sin(lifeRatio * Math.PI) * 0.5 + 0.5;
      const currentSize = point.size * (0.5 + sizeMultiplier * 0.5);

      const gradient = this.ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        currentSize
      );
      // Smoother gaussian-like falloff to avoid visible dots at edges
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.1, `rgba(255, 255, 255, ${opacity * 0.95})`);
      gradient.addColorStop(0.25, `rgba(255, 255, 255, ${opacity * 0.8})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 255, ${opacity * 0.55})`);
      gradient.addColorStop(0.55, `rgba(255, 255, 255, ${opacity * 0.3})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.12})`);
      gradient.addColorStop(0.85, `rgba(255, 255, 255, ${opacity * 0.03})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, currentSize, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.texture.needsUpdate = true;
  }

  getTexture() {
    return this.texture;
  }

  destroy() {
    this.texture.dispose();
    this.points = [];
  }
}

// Simple vertex shader
const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader - blends through 6 baked textures based on trail
const fragmentShader = `
  uniform sampler2D tBake1;
  uniform sampler2D tBake2;
  uniform sampler2D tBake3;
  uniform sampler2D tBake4;
  uniform sampler2D tBake5;
  uniform sampler2D tBake6;
  uniform sampler2D tPlaster;
  uniform sampler2D tTrail;
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uTextureScale;
  uniform float uTextureStrength;
  uniform vec3 uMultiplyColor;
  uniform float uFresnelEnabled;
  uniform vec3 uFresnelColor;
  uniform float uFresnelStrength;
  uniform float uEdgeFade;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Sample trail with slight blur to remove edge artifacts
    vec2 texelSize = vec2(1.0 / 512.0); // Trail texture resolution
    float rawTrail = 0.0;
    rawTrail += texture2D(tTrail, uv).r * 0.4;
    rawTrail += texture2D(tTrail, uv + vec2(texelSize.x, 0.0)).r * 0.15;
    rawTrail += texture2D(tTrail, uv - vec2(texelSize.x, 0.0)).r * 0.15;
    rawTrail += texture2D(tTrail, uv + vec2(0.0, texelSize.y)).r * 0.15;
    rawTrail += texture2D(tTrail, uv - vec2(0.0, texelSize.y)).r * 0.15;
    
    // Apply feathering/smoothing to the trail edges
    float trail = smoothstep(0.0, 0.3, rawTrail) * smoothstep(0.0, 1.0, rawTrail);
    trail = pow(trail, 0.7);
    
    // Sample plaster/grunge texture with tiling
    vec4 plaster = texture2D(tPlaster, uv * uTextureScale);
    
    // Sample all 6 baked textures
    vec4 bake1 = texture2D(tBake1, uv);
    vec4 bake2 = texture2D(tBake2, uv);
    vec4 bake3 = texture2D(tBake3, uv);
    vec4 bake4 = texture2D(tBake4, uv);
    vec4 bake5 = texture2D(tBake5, uv);
    vec4 bake6 = texture2D(tBake6, uv);
    
    // Progressive blend through the 6 textures based on trail intensity
    vec4 color;
    float t = trail * 5.0;
    
    if (t < 1.0) {
      color = mix(bake1, bake2, t);
    } else if (t < 2.0) {
      color = mix(bake2, bake3, t - 1.0);
    } else if (t < 3.0) {
      color = mix(bake3, bake4, t - 2.0);
    } else if (t < 4.0) {
      color = mix(bake4, bake5, t - 3.0);
    } else {
      color = mix(bake5, bake6, min(t - 4.0, 1.0));
    }
    
    // Apply multiply color (like davincii's uColor) - darkens the base
    color.rgb *= uMultiplyColor;
    
    // Apply grunge/plaster texture as FULL multiply (like davincii.com)
    // uTextureStrength controls how much the grunge affects the image
    // At 1.0, it's a full multiply which significantly darkens the image
    color.rgb *= mix(vec3(1.0), plaster.rgb, uTextureStrength);
    
    // Edge glow effect at trail boundaries
    if (uFresnelEnabled > 0.5) {
      float edgeGlow = smoothstep(0.05, 0.2, trail) - smoothstep(0.3, 0.7, trail);
      color.rgb += uFresnelColor * edgeGlow * uFresnelStrength;
      color.rgb += uFresnelColor * trail * uFresnelStrength * 0.08;
    }
    
    // Edge fade/vignette for smooth blending with surrounding content
    if (uEdgeFade > 0.0) {
      // Calculate distance from edges (0 at edge, 1 in center)
      vec2 edgeDist = min(uv, 1.0 - uv);
      float fadeX = smoothstep(0.0, uEdgeFade, edgeDist.x);
      float fadeY = smoothstep(0.0, uEdgeFade, edgeDist.y);
      float edgeAlpha = fadeX * fadeY;
      
      // Apply fade to alpha
      color.a *= edgeAlpha;
    }
    
    gl_FragColor = color;
  }
`;

interface BakedTextures {
  bake1: string;
  bake2: string;
  bake3: string;
  bake4: string;
  bake5: string;
  bake6: string;
  plaster?: string;
  grunge?: string;
}

interface BakedReliefPlaneProps {
  textures: BakedTextures;
  textureScale?: number;
  textureStrength?: number;
  multiplyColor?: string;
  fresnelEnabled?: boolean;
  fresnelColor?: string;
  fresnelStrength?: number;
  trailSize?: number;
  trailFadeSpeed?: number;
  trailMaxAge?: number;
  trailIntensity?: number;
  ambientIntensity?: number;
  mouseLerp?: number;
  mouseInfluence?: number;
  rotationSpeed?: number;
  edgeFade?: number;
  aspectRatio?: number;
  // Performance options
  trailResolution?: number;
  isVisible?: boolean;
}

function BakedReliefPlane({
  textures,
  textureScale = 5.0,
  textureStrength = 1.0,
  multiplyColor = "#161616",
  fresnelEnabled = false,
  fresnelColor = "#ffffff",
  fresnelStrength = 0.0,
  trailSize = 0.1,
  trailFadeSpeed = 0.9,
  trailMaxAge = 120,
  trailIntensity = 0.05,
  ambientIntensity = 0.2,
  mouseLerp = 1.0,
  mouseInfluence = 0.05,
  rotationSpeed = 0.0003,
  edgeFade = 0.05,
  aspectRatio = 1,
  trailResolution = 256,
  isVisible = true,
}: BakedReliefPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const trailRef = useRef<Trail | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const prevMouseRef = useRef({ x: 0.5, y: 0.5 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { viewport, size, gl } = useThree();

  // Initialize trail only once - use lower resolution for better performance
  useEffect(() => {
    trailRef.current = new Trail(trailResolution, trailResolution, {
      baseSize: trailSize,
      fadeSpeed: trailFadeSpeed,
      maxAge: trailMaxAge,
      intensity: trailIntensity,
    });
    return () => trailRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailResolution]); // Recreate only if resolution changes

  // Update trail settings without recreating
  useEffect(() => {
    if (trailRef.current) {
      trailRef.current.setBaseSize(trailSize);
      trailRef.current.setFadeSpeed(trailFadeSpeed);
      trailRef.current.setMaxAge(trailMaxAge);
      trailRef.current.setIntensity(trailIntensity);
    }
  }, [trailSize, trailFadeSpeed, trailMaxAge, trailIntensity]);

  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);

  // Parse fresnel color
  const parsedFresnelColor = useMemo(() => {
    const h = fresnelColor.replace("#", "");
    return new THREE.Vector3(
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    );
  }, [fresnelColor]);

  // Parse multiply color (like davincii's uColor - darkens the image)
  const parsedMultiplyColor = useMemo(() => {
    const h = multiplyColor.replace("#", "");
    return new THREE.Vector3(
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    );
  }, [multiplyColor]);

  // Track texture loading state
  const [texturesReady, setTexturesReady] = useState(false);

  // Load textures using the global cache (shared across all instances)
  useEffect(() => {
    let cancelled = false;

    // Start loading all textures (uses cache if already loaded)
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
        // Use requestIdleCallback to defer the "ready" state change
        if ("requestIdleCallback" in window) {
          (window as Window).requestIdleCallback(
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
      // Release texture references on unmount
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

  // Get current textures from cache (returns placeholders if still loading)
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
    // Re-run when textures become ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures, texturesReady]);

  // Create shader material once, update uniforms when textures change
  const shaderMaterial = useMemo(() => {
    const dummyTrailTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    dummyTrailTexture.needsUpdate = true;

    return new THREE.ShaderMaterial({
      uniforms: {
        tBake1: { value: null },
        tBake2: { value: null },
        tBake3: { value: null },
        tBake4: { value: null },
        tBake5: { value: null },
        tBake6: { value: null },
        tPlaster: { value: null },
        tTrail: { value: dummyTrailTexture },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Create once, never recreate

  // Update texture uniforms when loaded textures change (from cache)
  useEffect(() => {
    shaderMaterial.uniforms.tBake1.value = loadedTextures.bake1;
    shaderMaterial.uniforms.tBake2.value = loadedTextures.bake2;
    shaderMaterial.uniforms.tBake3.value = loadedTextures.bake3;
    shaderMaterial.uniforms.tBake4.value = loadedTextures.bake4;
    shaderMaterial.uniforms.tBake5.value = loadedTextures.bake5;
    shaderMaterial.uniforms.tBake6.value = loadedTextures.bake6;
    shaderMaterial.uniforms.tPlaster.value = loadedTextures.plaster;
    shaderMaterial.needsUpdate = true;
  }, [shaderMaterial, loadedTextures]);

  // Cleanup shader material on unmount
  useEffect(() => {
    return () => {
      shaderMaterial.dispose();
    };
  }, [shaderMaterial]);

  // Update uniforms when props change - update shaderMaterial directly for immediate effect
  useEffect(() => {
    shaderMaterial.uniforms.uTextureScale.value = textureScale;
    shaderMaterial.uniforms.uTextureStrength.value = textureStrength;
    shaderMaterial.uniforms.uMultiplyColor.value = parsedMultiplyColor;
    shaderMaterial.uniforms.uFresnelEnabled.value = fresnelEnabled ? 1.0 : 0.0;
    shaderMaterial.uniforms.uFresnelColor.value = parsedFresnelColor;
    shaderMaterial.uniforms.uFresnelStrength.value = fresnelStrength;
    shaderMaterial.uniforms.uEdgeFade.value = edgeFade;
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

  // Store raw client coordinates so we can recalculate on scroll
  const clientCoordsRef = useRef({ x: 0, y: 0 });

  // Mouse handlers - store raw client coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      clientCoordsRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      clientCoordsRef.current = { x: touch.clientX, y: touch.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!materialRef.current || !trailRef.current || !meshRef.current) return;

    // Skip expensive updates when not visible (optimization)
    if (!isVisible) return;

    // Recalculate mouse position relative to canvas on every frame
    // This ensures scrolling updates the position even without mouse movement
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      targetMouseRef.current = {
        x: (clientCoordsRef.current.x - rect.left) / rect.width,
        y: 1 - (clientCoordsRef.current.y - rect.top) / rect.height,
      };
    }

    // Smooth mouse following (lerp speed controls responsiveness)
    mouseRef.current.x +=
      (targetMouseRef.current.x - mouseRef.current.x) * mouseLerp;
    mouseRef.current.y +=
      (targetMouseRef.current.y - mouseRef.current.y) * mouseLerp;

    // Add points to trail
    const dx = mouseRef.current.x - prevMouseRef.current.x;
    const dy = mouseRef.current.y - prevMouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.001) {
      const steps = Math.ceil(distance * 30); // Reduced for better performance
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        trailRef.current.addPoint(
          prevMouseRef.current.x + dx * t,
          prevMouseRef.current.y + dy * t
        );
      }
    }

    prevMouseRef.current = { ...mouseRef.current };

    // Update ambient trails (automatic movement independent of mouse)
    trailRef.current.setAmbientIntensity(ambientIntensity);
    trailRef.current.updateAmbient(state.clock.elapsedTime);

    trailRef.current.update();

    // Update uniforms
    materialRef.current.uniforms.tTrail.value = trailRef.current.getTexture();
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.set(
      mouseRef.current.x,
      mouseRef.current.y
    );

    // Subtle mouse-based rotation for 3D feel
    meshRef.current.rotation.x = (mouseRef.current.y - 0.5) * mouseInfluence;
    meshRef.current.rotation.y =
      (mouseRef.current.x - 0.5) * mouseInfluence +
      state.clock.elapsedTime * rotationSpeed;
  });

  // Calculate plane size to fill viewport with given aspect ratio
  const planeSize = useMemo(() => {
    const imageAspect = aspectRatio; // width / height
    const viewportAspect = size.width / size.height;

    if (viewportAspect > imageAspect) {
      return { width: viewport.height * imageAspect, height: viewport.height };
    } else {
      return { width: viewport.width, height: viewport.width / imageAspect };
    }
  }, [viewport, size, aspectRatio]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeSize.width * 0.95, planeSize.height * 0.95]} />
      <primitive object={shaderMaterial} attach="material" ref={materialRef} />
    </mesh>
  );
}

export interface BakedReliefProps {
  /** URLs to the 6 baked textures (from flat/invisible to fully revealed) */
  textures: BakedTextures;
  /** Plaster/detail texture scale (default: 1.0) */
  textureScale?: number;
  /** Plaster texture blend strength - 1.0 = full grunge (default: 1.0) */
  textureStrength?: number;
  /** Multiply color to darken the base (default: "#ffffff" = no darkening) */
  multiplyColor?: string;
  /** Enable/disable edge glow effect (default: true) */
  fresnelEnabled?: boolean;
  /** Edge glow color (default: "#ffffff") */
  fresnelColor?: string;
  /** Edge glow intensity (default: 0.3) */
  fresnelStrength?: number;
  /** Trail brush size (default: 0.12) */
  trailSize?: number;
  /** Trail fade speed 0-1, higher = longer persistence (default: 0.985) */
  trailFadeSpeed?: number;
  /** Trail max age in frames (default: 120) */
  trailMaxAge?: number;
  /** Trail intensity per stroke, lower = more gradual reveal (default: 0.15) */
  trailIntensity?: number;
  /** Ambient trail intensity, creates automatic trails without mouse (default: 0.3) */
  ambientIntensity?: number;
  /** Mouse lerp speed, higher = more responsive (default: 0.15) */
  mouseLerp?: number;
  /** Mouse influence on rotation (default: 0.05) */
  mouseInfluence?: number;
  /** Auto rotation speed (default: 0.0003) */
  rotationSpeed?: number;
  /** Edge fade amount for smooth blending with surrounding content (default: 0.15) */
  edgeFade?: number;
  /** Aspect ratio of the plane (width/height, default: 1 = square) */
  aspectRatio?: number;
  /** Trail texture resolution - lower = better performance (default: 256) */
  trailResolution?: number;
  /** Pause rendering when not visible - uses IntersectionObserver (default: true) */
  pauseWhenHidden?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Container style */
  style?: React.CSSProperties;
}

export default function BakedRelief({
  textures,
  textureScale = 5.0,
  textureStrength = 1.0,
  multiplyColor = "#161616",
  fresnelEnabled = false,
  fresnelColor = "#ffffff",
  fresnelStrength = 0.0,
  trailSize = 0.1,
  trailFadeSpeed = 0.9,
  trailMaxAge = 120,
  trailIntensity = 0.05,
  ambientIntensity = 0.2,
  mouseLerp = 1.0,
  mouseInfluence = 0.05,
  rotationSpeed = 0.0003,
  edgeFade = 0.05,
  aspectRatio = 1,
  trailResolution = 256,
  pauseWhenHidden = true,
  className = "",
  style,
}: BakedReliefProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Start NOT visible - defer rendering until ready
  const [isVisible, setIsVisible] = useState(false);
  // Track if component has initialized (deferred)
  const [isInitialized, setIsInitialized] = useState(false);
  // Control frameloop mode - start with "demand" for lighter init
  const [frameloopMode, setFrameloopMode] = useState<"demand" | "always">(
    "demand"
  );

  // Deferred initialization - don't start heavy work immediately
  useEffect(() => {
    let cancelled = false;

    // Defer initialization to avoid blocking mount
    const init = () => {
      if (cancelled) return;
      setIsInitialized(true);

      // After a short delay, switch to continuous rendering
      setTimeout(() => {
        if (!cancelled) {
          setFrameloopMode("always");
        }
      }, 100);
    };

    if ("requestIdleCallback" in window) {
      const id = (window as Window).requestIdleCallback(init, { timeout: 300 });
      return () => {
        cancelled = true;
        (window as Window).cancelIdleCallback(id);
      };
    } else {
      const timer = setTimeout(init, 50);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, []);

  // Use IntersectionObserver to pause rendering when off-screen
  useEffect(() => {
    if (!pauseWhenHidden || !isInitialized) {
      if (isInitialized) setIsVisible(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.01, rootMargin: "50px" } // Slight margin to pre-initialize
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [pauseWhenHidden, isInitialized]);

  // Don't render Canvas until initialized (deferred)
  if (!isInitialized) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: "100%", height: "100%", ...style }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <Canvas
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          // Reduce initial GPU memory allocation
          depth: false,
          stencil: false,
        }}
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        frameloop={frameloopMode}
        dpr={[1, 1.5]} // Limit DPR to reduce GPU load
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
