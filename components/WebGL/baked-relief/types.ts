import type { CSSProperties } from "react";
import type * as THREE from "three";

export interface BakedTextures {
  bake1: string;
  bake2: string;
  bake3: string;
  bake4: string;
  bake5: string;
  bake6: string;
  plaster?: string;
  grunge?: string;
}

export interface CachedTexture {
  texture: THREE.Texture;
  refCount: number;
  loading: boolean;
  promise: Promise<THREE.Texture>;
}

export interface TrailOptions {
  maxAge?: number;
  baseSize?: number;
  fadeSpeed?: number;
  intensity?: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  age: number;
  size: number;
}

export interface BakedReliefPlaneProps {
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
  trailResolution?: number;
  isVisible?: boolean;
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
  style?: CSSProperties;
}

// Default values as constants for better tree-shaking
export const DEFAULT_TEXTURE_SCALE = 1.0;
export const DEFAULT_TEXTURE_STRENGTH = 0.0;
export const DEFAULT_MULTIPLY_COLOR = "#ffffff";
export const DEFAULT_FRESNEL_ENABLED = false;
export const DEFAULT_FRESNEL_COLOR = "#ffffff";
export const DEFAULT_FRESNEL_STRENGTH = 0.0;
export const DEFAULT_TRAIL_SIZE = 0.1;
export const DEFAULT_TRAIL_FADE_SPEED = 0.9;
export const DEFAULT_TRAIL_MAX_AGE = 120;
export const DEFAULT_TRAIL_INTENSITY = 0.05;
export const DEFAULT_AMBIENT_INTENSITY = 0.2;
export const DEFAULT_MOUSE_LERP = 1.0;
export const DEFAULT_MOUSE_INFLUENCE = 0.05;
export const DEFAULT_ROTATION_SPEED = 0.0003;
export const DEFAULT_EDGE_FADE = 0.05;
export const DEFAULT_ASPECT_RATIO = 1;
export const DEFAULT_TRAIL_RESOLUTION = 256;
