import * as THREE from "three";
import type { CachedTexture } from "./types";

// ============================================================================
// GLOBAL TEXTURE CACHE - Shared across ALL BakedRelief instances
// ============================================================================

const textureCache = new Map<string, CachedTexture>();
const textureLoader = new THREE.TextureLoader();

// Pre-created dummy texture for reuse (avoids allocations)
let sharedDummyTexture: THREE.Texture | null = null;

function getSharedDummyTexture(): THREE.Texture {
  if (!sharedDummyTexture) {
    sharedDummyTexture = new THREE.DataTexture(
      new Uint8Array([32, 32, 32, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    sharedDummyTexture.needsUpdate = true;
  }
  return sharedDummyTexture;
}

export function createDummyTexture(): THREE.Texture {
  const tex = new THREE.DataTexture(
    new Uint8Array([32, 32, 32, 255]),
    1,
    1,
    THREE.RGBAFormat
  );
  tex.needsUpdate = true;
  return tex;
}

function createPlaceholderTexture(): THREE.Texture {
  const placeholder = new THREE.DataTexture(
    new Uint8Array([32, 32, 32, 255]),
    1,
    1,
    THREE.RGBAFormat
  );
  placeholder.needsUpdate = true;
  return placeholder;
}

export function getOrLoadTexture(
  url: string,
  repeat = false
): Promise<THREE.Texture> {
  const cacheKey = `${url}:${repeat}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    cached.refCount++;
    return cached.promise;
  }

  const promise = new Promise<THREE.Texture>((resolve) => {
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
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(load, { timeout: 200 });
    } else if (typeof window !== "undefined") {
      setTimeout(load, 0);
    } else {
      load();
    }
  });

  textureCache.set(cacheKey, {
    texture: createPlaceholderTexture(),
    refCount: 1,
    loading: true,
    promise,
  });

  return promise;
}

export function releaseTexture(url: string, repeat = false): void {
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

export function getTextureSync(url: string, repeat = false): THREE.Texture {
  const cacheKey = `${url}:${repeat}`;
  const cached = textureCache.get(cacheKey);
  return cached?.texture ?? getSharedDummyTexture();
}

// Batch loading helper for better performance
export function loadTexturesBatch(
  textures: { url: string; repeat?: boolean }[]
): Promise<THREE.Texture[]> {
  return Promise.all(
    textures.map(({ url, repeat }) => getOrLoadTexture(url, repeat ?? false))
  );
}

// Batch release helper
export function releaseTexturesBatch(
  textures: { url: string; repeat?: boolean }[]
): void {
  for (const { url, repeat } of textures) {
    releaseTexture(url, repeat ?? false);
  }
}
