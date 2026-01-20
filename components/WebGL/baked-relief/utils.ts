import * as THREE from "three";

/**
 * Parse hex color string to THREE.Vector3
 * Cached results for performance
 */
const colorCache = new Map<string, THREE.Vector3>();

export function parseHexColor(hex: string): THREE.Vector3 {
  const cached = colorCache.get(hex);
  if (cached) return cached;

  const h = hex.replace("#", "");
  const vector = new THREE.Vector3(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );

  colorCache.set(hex, vector);
  return vector;
}

/**
 * Calculate plane size to fill viewport with given aspect ratio
 */
export function calculatePlaneSize(
  viewportWidth: number,
  viewportHeight: number,
  sizeWidth: number,
  sizeHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  const imageAspect = aspectRatio;
  const viewportAspect = sizeWidth / sizeHeight;

  if (viewportAspect > imageAspect) {
    return { width: viewportHeight * imageAspect, height: viewportHeight };
  }
  return { width: viewportWidth, height: viewportWidth / imageAspect };
}

/**
 * Defer execution using requestIdleCallback or fallback
 */
export function deferExecution(
  callback: () => void,
  options?: { timeout?: number }
): () => void {
  let cancelled = false;
  let id: number | ReturnType<typeof setTimeout>;

  const execute = () => {
    if (!cancelled) callback();
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    id = window.requestIdleCallback(execute, {
      timeout: options?.timeout ?? 200,
    });
    return () => {
      cancelled = true;
      window.cancelIdleCallback(id as number);
    };
  } else if (typeof window !== "undefined") {
    id = setTimeout(execute, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }

  // SSR fallback
  callback();
  return () => {};
}
