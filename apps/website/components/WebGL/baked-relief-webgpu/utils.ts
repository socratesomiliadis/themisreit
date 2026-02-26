/** WebGPU default device texture size limit (when no requiredLimits specified) */
export const WEBGPU_DEFAULT_MAX_TEXTURE_SIZE = 8192;

export interface WebGPUSupport {
  supported: boolean;
  maxTextureSize?: number;
}

/** Detect Safari (including iOS Safari) which has known WebGPU issues with three.js */
export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isSafariBrowser = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  return isSafariBrowser || isIOS;
}

/**
 * Check if WebGPU is supported and reliable.
 * Reads limits directly from the adapter (no device creation needed).
 * Forces WebGL fallback on Safari for stability.
 */
export async function checkWebGPUSupport(): Promise<WebGPUSupport> {
  if (typeof navigator === "undefined" || !navigator.gpu) {
    return { supported: false };
  }

  if (isSafari()) {
    console.info("Safari detected — using WebGL for better compatibility");
    return { supported: false };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return { supported: false };

    const maxTextureSize = adapter.limits.maxTextureDimension2D;
    return { supported: true, maxTextureSize };
  } catch {
    return { supported: false };
  }
}

/**
 * Calculate a pixel ratio that won't exceed WebGPU's max texture dimension.
 * Applies a 5% safety margin to guard against rounding.
 */
export function calculateSafePixelRatio(
  width: number,
  height: number,
  desiredPixelRatio: number,
  maxTextureSize: number
): number {
  const maxDimension = Math.max(width, height);
  const maxSafeRatio = (maxTextureSize / maxDimension) * 0.95;
  return Math.max(1, Math.min(desiredPixelRatio, maxSafeRatio));
}

/** Parse a hex color string (#RRGGBB) to normalized RGB tuple (0–1). Falls back to white. */
export function parseHexColor(hex: string): [number, number, number] {
  try {
    const h = (hex || "#ffffff").replace("#", "");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1];
    return [r, g, b];
  } catch {
    return [1, 1, 1];
  }
}
