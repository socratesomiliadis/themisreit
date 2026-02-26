import type { Texture, CanvasTexture } from "three";
import { parseHexColor } from "./utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Uniform references for runtime updates without re-creating the material */
export interface UniformRefs {
  uMultiplyR: { value: number };
  uMultiplyG: { value: number };
  uMultiplyB: { value: number };
  uTextureScale: { value: number };
  uTextureStrength: { value: number };
  uEdgeFade: { value: number };
}

export interface ReliefMaterialConfig {
  trailTexture: CanvasTexture;
  bakeTextures: Texture[];
  plasterTexture: Texture | null;
  multiplyColor: string;
  textureScale: number;
  textureStrength: number;
  edgeFade: number;
  /** Trail blur quality: 1 = no blur, 3 = light, 5 = full (default: 5) */
  blurSamples?: 1 | 3 | 5;
}

// ---------------------------------------------------------------------------
// Shader constants
// ---------------------------------------------------------------------------

const BLUR_TEXEL_SIZE = 1.0 / 512.0;
const FEATHER_POWER = 0.7;
const BAKE_BLEND_RANGE = 5.0;

// ---------------------------------------------------------------------------
// Material factory
// ---------------------------------------------------------------------------

/**
 * Creates a NodeMaterial that blends through 6 baked texture levels driven
 * by a canvas-based trail intensity map.
 *
 * The `blurSamples` config controls quality:
 *   - 5: full 5-tap cross blur (high quality)
 *   - 3: 3-tap blur (medium quality)
 *   - 1: single sample, no blur (low quality / fastest)
 */
export async function createReliefMaterial(config: ReliefMaterialConfig) {
  const { NodeMaterial } = await import("three/webgpu");
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

  const { trailTexture, bakeTextures, plasterTexture } = config;
  const blurSamples = config.blurSamples ?? 5;
  const [bake1, bake2, bake3, bake4, bake5, bake6] = bakeTextures;

  const [mr, mg, mb] = parseHexColor(config.multiplyColor);
  const uMultiplyR = uniform(mr);
  const uMultiplyG = uniform(mg);
  const uMultiplyB = uniform(mb);
  const uTextureScale = uniform(config.textureScale);
  const uTextureStrength = uniform(config.textureStrength);
  const uEdgeFade = uniform(config.edgeFade);

  const uniforms: UniformRefs = {
    uMultiplyR,
    uMultiplyG,
    uMultiplyB,
    uTextureScale,
    uTextureStrength,
    uEdgeFade,
  };

  const material = new NodeMaterial();

  material.colorNode = Fn(() => {
    const vuv = uv();

    // --- Trail sampling (quality-tiered) ---
    let rawTrail;

    if (blurSamples === 1) {
      // No blur — single sample (fastest)
      rawTrail = texture(trailTexture, vuv).r;
    } else if (blurSamples === 3) {
      // Light blur — 3-tap (center + 2 neighbours)
      const texelSize = float(BLUR_TEXEL_SIZE);
      rawTrail = mul(texture(trailTexture, vuv).r, 0.5);
      rawTrail = add(
        rawTrail,
        mul(
          texture(trailTexture, add(vuv, vec2(texelSize, 0))).r,
          0.25
        )
      );
      rawTrail = add(
        rawTrail,
        mul(
          texture(trailTexture, add(vuv, vec2(0, texelSize))).r,
          0.25
        )
      );
    } else {
      // Full 5-tap cross blur
      const texelSize = float(BLUR_TEXEL_SIZE);
      rawTrail = mul(texture(trailTexture, vuv).r, 0.4);
      rawTrail = add(
        rawTrail,
        mul(
          texture(trailTexture, add(vuv, vec2(texelSize, 0))).r,
          0.15
        )
      );
      rawTrail = add(
        rawTrail,
        mul(
          texture(trailTexture, sub(vuv, vec2(texelSize, 0))).r,
          0.15
        )
      );
      rawTrail = add(
        rawTrail,
        mul(
          texture(trailTexture, add(vuv, vec2(0, texelSize))).r,
          0.15
        )
      );
      rawTrail = add(
        rawTrail,
        mul(
          texture(trailTexture, sub(vuv, vec2(0, texelSize))).r,
          0.15
        )
      );
    }

    // --- Feather trail edges ---
    const trailSmooth = mul(
      smoothstep(0, 0.3, rawTrail),
      smoothstep(0, 1, rawTrail)
    );
    const trailValue = tslPow(trailSmooth, FEATHER_POWER);

    // --- Bake-level blending ---
    const b1 = texture(bake1, vuv);
    const b2 = texture(bake2, vuv);
    const b3 = texture(bake3, vuv);
    const b4 = texture(bake4, vuv);
    const b5 = texture(bake5, vuv);
    const b6 = texture(bake6, vuv);

    const t = mul(trailValue, BAKE_BLEND_RANGE);
    let color = mix(b1, b2, smoothstep(0, 1, t));
    color = mix(color, b3, smoothstep(1, 2, t));
    color = mix(color, b4, smoothstep(2, 3, t));
    color = mix(color, b5, smoothstep(3, 4, t));
    color = mix(color, b6, smoothstep(4, 5, t));

    // --- Multiply color tint ---
    let finalR = mul(color.r, uMultiplyR);
    let finalG = mul(color.g, uMultiplyG);
    let finalB = mul(color.b, uMultiplyB);

    // --- Optional plaster / detail overlay ---
    if (plasterTexture) {
      const plasterUV = mul(vuv, uTextureScale);
      const plasterSample = texture(plasterTexture, plasterUV);
      finalR = mul(finalR, mix(float(1.0), plasterSample.r, uTextureStrength));
      finalG = mul(finalG, mix(float(1.0), plasterSample.g, uTextureStrength));
      finalB = mul(finalB, mix(float(1.0), plasterSample.b, uTextureStrength));
    }

    const finalColor = vec3(finalR, finalG, finalB);

    // --- Edge-fade vignette ---
    const edgeDistX = tslMin(vuv.x, sub(1, vuv.x));
    const edgeDistY = tslMin(vuv.y, sub(1, vuv.y));
    const fadeX = smoothstep(0, uEdgeFade, edgeDistX);
    const fadeY = smoothstep(0, uEdgeFade, edgeDistY);
    const edgeAlpha = mul(fadeX, fadeY);

    return vec4(finalColor, mul(color.a, edgeAlpha));
  })();

  material.transparent = true;

  return { material, uniforms };
}
