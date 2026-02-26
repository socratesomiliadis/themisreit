import * as THREE from "three";
import type { CachedTexture } from "./types";

// ---------------------------------------------------------------------------
// Global texture cache — shared across all BakedRelief instances
// ---------------------------------------------------------------------------

const textureCache = new Map<string, CachedTexture>();
const textureLoader = new THREE.TextureLoader();

// Shared 1x1 gray placeholder (singleton, never disposed)
let sharedPlaceholder: THREE.DataTexture | null = null;

function getSharedPlaceholder(): THREE.DataTexture {
  if (!sharedPlaceholder) {
    sharedPlaceholder = new THREE.DataTexture(
      new Uint8Array([32, 32, 32, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    sharedPlaceholder.needsUpdate = true;
  }
  return sharedPlaceholder;
}

/** Create a new 1x1 gray DataTexture (caller owns the lifecycle) */
export function createDummyTexture(): THREE.DataTexture {
  const tex = new THREE.DataTexture(
    new Uint8Array([32, 32, 32, 255]),
    1,
    1,
    THREE.RGBAFormat
  );
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------------------
// Optional KTX2 support
// Consumers call setKTX2Loader() once to enable compressed texture loading.
// The cache auto-detects .ktx2 extensions and uses the provided loader.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ktx2Loader: any = null;

/**
 * Register a pre-configured KTX2Loader.
 *
 * Usage (call once during app init):
 * ```ts
 * import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
 *
 * const loader = new KTX2Loader()
 *   .setTranscoderPath('/basis/')
 *   .detectSupport(renderer);
 *
 * setKTX2Loader(loader);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setKTX2Loader(loader: any): void {
  ktx2Loader = loader;
}

function isKTX2(url: string): boolean {
  return url.toLowerCase().endsWith(".ktx2");
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Load a texture through the cache. Increments the ref count if already cached.
 * On load error, resolves with a 1x1 gray fallback instead of rejecting.
 *
 * Supports both standard image formats (PNG/JPEG/WebP) and KTX2 compressed
 * textures when a KTX2Loader has been registered via `setKTX2Loader()`.
 */
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
    const configure = (tex: THREE.Texture) => {
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
    };

    const fallback = () => {
      console.warn(`Failed to load texture: ${url}, using fallback`);
      const dummy = createDummyTexture();
      dummy.colorSpace = THREE.NoColorSpace;
      resolve(dummy);
    };

    const load = () => {
      if (isKTX2(url) && ktx2Loader) {
        ktx2Loader.load(url, configure, undefined, fallback);
      } else {
        textureLoader.load(url, configure, undefined, fallback);
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(load, { timeout: 200 });
    } else if (typeof window !== "undefined") {
      setTimeout(load, 0);
    } else {
      load();
    }
  });

  textureCache.set(cacheKey, {
    texture: createDummyTexture(),
    refCount: 1,
    loading: true,
    promise,
  });

  return promise;
}

/** Decrement the ref count and dispose when no longer referenced */
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

/** Get a texture synchronously from cache, or the shared placeholder if not loaded yet */
export function getTextureSync(url: string, repeat = false): THREE.Texture {
  const cacheKey = `${url}:${repeat}`;
  const cached = textureCache.get(cacheKey);
  return cached?.texture ?? getSharedPlaceholder();
}

/** Load multiple textures in parallel through the cache */
export function loadTexturesBatch(
  textures: { url: string; repeat?: boolean }[]
): Promise<THREE.Texture[]> {
  return Promise.all(
    textures.map(({ url, repeat }) => getOrLoadTexture(url, repeat ?? false))
  );
}

/** Release multiple textures at once */
export function releaseTexturesBatch(
  textures: { url: string; repeat?: boolean }[]
): void {
  for (const { url, repeat } of textures) {
    releaseTexture(url, repeat ?? false);
  }
}
