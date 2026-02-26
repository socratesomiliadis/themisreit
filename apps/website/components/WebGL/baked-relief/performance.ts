/**
 * Performance tier detection and quality settings
 * Detects device capabilities and returns appropriate quality settings
 */

export type PerformanceTier = "high" | "medium" | "low";

export interface QualitySettings {
  tier: PerformanceTier;
  /** Device pixel ratio to use */
  dpr: [number, number];
  /** Trail texture resolution */
  trailResolution: number;
  /** Number of gradient stops in trail (fewer = faster) */
  trailGradientStops: number;
  /** Maximum trail points */
  maxTrailPoints: number;
  /** Trail update throttle in ms */
  trailUpdateInterval: number;
  /** Number of ambient particles */
  ambientParticles: number;
  /** Whether to use trail blur in shader */
  useTrailBlur: boolean;
  /** Number of trail blur samples (1 = no blur, 3 = light blur, 5 = full blur) */
  trailBlurSamples: 1 | 3 | 5;
  /** Target FPS (used for throttling) */
  targetFps: number;
}

// Quality presets
const QUALITY_PRESETS: Record<PerformanceTier, QualitySettings> = {
  high: {
    tier: "high",
    dpr: [1, 2],
    trailResolution: 256,
    trailGradientStops: 6,
    maxTrailPoints: 400,
    trailUpdateInterval: 16,
    ambientParticles: 3,
    useTrailBlur: true,
    trailBlurSamples: 5,
    targetFps: 45,
  },
  medium: {
    tier: "medium",
    dpr: [0.5, 1],
    trailResolution: 128,
    trailGradientStops: 4,
    maxTrailPoints: 250,
    trailUpdateInterval: 20,
    ambientParticles: 2,
    useTrailBlur: true,
    trailBlurSamples: 3,
    targetFps: 30,
  },
  low: {
    tier: "low",
    dpr: [0.5, 1],
    trailResolution: 96,
    trailGradientStops: 3,
    maxTrailPoints: 150,
    trailUpdateInterval: 25,
    ambientParticles: 1,
    useTrailBlur: false,
    trailBlurSamples: 1,
    targetFps: 30,
  },
};

// Cache the detected tier
let cachedTier: PerformanceTier | null = null;
let cachedSettings: QualitySettings | null = null;

/**
 * Detect the performance tier based on device capabilities
 */
export function detectPerformanceTier(): PerformanceTier {
  if (cachedTier !== null) return cachedTier;

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    cachedTier = "medium";
    return cachedTier;
  }

  let score = 0;

  // Check device memory (Chrome only)
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory !== undefined) {
    if (nav.deviceMemory >= 8) score += 2;
    else if (nav.deviceMemory >= 4) score += 1;
    else score -= 1;
  }

  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency !== undefined) {
    if (navigator.hardwareConcurrency >= 8) score += 2;
    else if (navigator.hardwareConcurrency >= 4) score += 1;
    else score -= 1;
  }

  // Check if mobile device (generally lower performance)
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  if (isMobile) score -= 2;

  // Check if iOS (tends to have good GPU but thermal throttling)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) score -= 1;

  // Check screen size - very large screens need more pixels
  const screenPixels = window.screen.width * window.screen.height;
  if (screenPixels > 4000000) score -= 1; // 4K+
  if (screenPixels > 8000000) score -= 1; // 5K+

  // Check WebGL capabilities
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const rendererLower = renderer.toLowerCase();

        // Detect integrated graphics
        if (
          rendererLower.includes("intel") ||
          rendererLower.includes("integrated")
        ) {
          score -= 2;
        }

        // Detect high-end GPUs
        if (
          rendererLower.includes("nvidia") ||
          rendererLower.includes("radeon") ||
          rendererLower.includes("amd")
        ) {
          // Check for specific high-end models
          if (
            rendererLower.includes("rtx") ||
            rendererLower.includes("rx 6") ||
            rendererLower.includes("rx 7")
          ) {
            score += 2;
          } else {
            score += 1;
          }
        }

        // Apple Silicon is generally good
        if (rendererLower.includes("apple")) {
          // M1/M2/M3 are good, but we still want to be conservative
          score += 1;
        }
      }

      // Check max texture size
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      if (maxTextureSize < 4096) score -= 1;
    }
  } catch {
    // WebGL check failed, assume medium
  }

  // Determine tier based on score
  if (score >= 3) {
    cachedTier = "high";
  } else if (score >= 0) {
    cachedTier = "medium";
  } else {
    cachedTier = "low";
  }

  console.info(`Performance tier detected: ${cachedTier} (score: ${score})`);
  return cachedTier;
}

/**
 * Get quality settings for the detected performance tier
 */
export function getQualitySettings(
  forceQuality?: PerformanceTier
): QualitySettings {
  if (forceQuality) {
    return { ...QUALITY_PRESETS[forceQuality] };
  }

  if (cachedSettings !== null) return cachedSettings;

  const tier = detectPerformanceTier();
  cachedSettings = { ...QUALITY_PRESETS[tier] };
  return cachedSettings;
}

/**
 * Reset cached detection (useful for testing)
 */
export function resetPerformanceCache(): void {
  cachedTier = null;
  cachedSettings = null;
}
