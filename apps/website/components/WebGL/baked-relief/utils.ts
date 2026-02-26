import * as THREE from "three";

/**
 * Parse hex color string to THREE.Vector3 (0–1 range).
 * Results are cached to avoid re-parsing the same color.
 */
const colorCache = new Map<string, THREE.Vector3>();

export function parseHexColor(hex: string): THREE.Vector3 {
  const cached = colorCache.get(hex);
  if (cached) return cached.clone();

  const h = hex.replace("#", "");
  const vector = new THREE.Vector3(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );

  colorCache.set(hex, vector);
  return vector.clone();
}

/**
 * Calculate plane size to fill viewport with the given aspect ratio.
 * Returns dimensions that fit within the viewport while maintaining the ratio.
 */
export function calculatePlaneSize(
  viewportWidth: number,
  viewportHeight: number,
  sizeWidth: number,
  sizeHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  const viewportAspect = sizeWidth / sizeHeight;

  if (viewportAspect > aspectRatio) {
    return { width: viewportHeight * aspectRatio, height: viewportHeight };
  }
  return { width: viewportWidth, height: viewportWidth / aspectRatio };
}
