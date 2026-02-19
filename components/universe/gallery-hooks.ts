import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import {
  DEVICE_PRESETS,
  applyConfigValues,
  config,
  DOM_DELTA_SCALE,
  clampZoomValue,
  CLICK_THRESHOLD_MS,
  DRAG_THRESHOLD_PX,
  ZOOM_TRIGGER_DELAY_MS,
} from "./config";
import {
  getTextureFilters,
  loadImageElement,
  createImageTexture,
  createTextureAtlas,
} from "./texture-utils";
import { toVector4, getSelectionFromPointer } from "./gallery-utils";
import type {
  DevicePreset,
  GalleryItem,
  GalleryUniforms,
  InteractionState,
  FocusSelection,
} from "./types";

// Device preset detection
const detectDevicePreset = (): DevicePreset => {
  if (typeof window === "undefined") {
    return "desktop";
  }
  const hasTouchSupport =
    "ontouchstart" in window ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const smallViewport = Math.min(window.innerWidth, window.innerHeight) <= 900;

  return hasTouchSupport || coarsePointer || smallViewport
    ? "mobile"
    : "desktop";
};

export const useDevicePreset = (): DevicePreset => {
  const [preset, setPreset] = useState<DevicePreset>(() =>
    detectDevicePreset()
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => {
      setPreset(detectDevicePreset());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return preset;
};

export const useResponsiveGalleryRuntime = () => {
  const preset = useDevicePreset();
  const runtimePreset = DEVICE_PRESETS[preset];
  const [configVersion, setConfigVersion] = useState(0);

  useLayoutEffect(() => {
    applyConfigValues(runtimePreset.config);
    setConfigVersion((version) => version + 1);
  }, [runtimePreset]);

  return {
    preset,
    configVersion,
    dpr: runtimePreset.dpr,
    maxVisibleItems: runtimePreset.projectLimit,
    allowHighResFocus: runtimePreset.enableHighResFocus,
    anisotropyCap: runtimePreset.maxAnisotropy,
    focusEnabled: runtimePreset.focusEnabled,
  };
};

// Uniforms management
const buildGalleryUniforms = ({
  size,
  itemCount,
  imageAtlas,
}: {
  size: { width: number; height: number };
  itemCount: number;
  imageAtlas: THREE.Texture;
}): GalleryUniforms => ({
  uOffset: { value: new THREE.Vector2(0, 0) },
  uResolution: {
    value: new THREE.Vector2(size.width, size.height),
  },
  uHoverColor: {
    value: toVector4(config.hoverColor),
  },
  uBackgroundColor: {
    value: toVector4(config.backgroundColor),
  },
  uMousePos: { value: new THREE.Vector2(-1, -1) },
  uVelocity: { value: new THREE.Vector2() },
  uZoom: { value: 1.0 },
  uCellSize: {
    value: config.cellSize.clone(),
  },
  uTextureCount: { value: itemCount },
  uImageAtlas: { value: imageAtlas },
  uDistortionAmount: { value: 1.0 },
  uHighResTexture: { value: null as THREE.Texture | null },
  uFocusedIndex: { value: -1.0 },
  uFocusBlend: { value: 0.0 },
});

export const useGalleryUniforms = ({
  size,
  itemCount,
  imageAtlas,
  configVersion,
}: {
  size: { width: number; height: number };
  itemCount: number;
  imageAtlas: THREE.Texture | null;
  configVersion: number;
}) => {
  const uniforms = useMemo<GalleryUniforms | null>(() => {
    if (!imageAtlas) {
      return null;
    }
    return buildGalleryUniforms({
      size,
      itemCount,
      imageAtlas,
    });
  }, [size.width, size.height, itemCount, imageAtlas, configVersion]);

  const uniformsRef = useRef<GalleryUniforms | null>(uniforms);

  useEffect(() => {
    if (uniforms) {
      uniformsRef.current = uniforms;
    }
  }, [uniforms]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uResolution.value.set(size.width, size.height);
  }, [size.width, size.height]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uTextureCount.value = itemCount;
  }, [itemCount]);

  return { uniforms, uniformsRef };
};

// Gallery texture atlas
export const useGalleryAtlases = (
  items: GalleryItem[],
  {
    maxAnisotropy = 1,
    supportsMipmaps = false,
  }: {
    maxAnisotropy?: number;
    supportsMipmaps?: boolean;
  } = {}
) => {
  const [imageAtlas, setImageAtlas] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!items.length) {
      setImageAtlas((previous) => {
        previous?.dispose();
        return null;
      });
      return;
    }

    let active = true;
    let loadedImageTextures: THREE.Texture[] = [];
    let atlas: THREE.Texture | null = null;

    (async () => {
      try {
        const loadedImages = await Promise.all(
          items.map((item) => loadImageElement(item.imageUrl))
        );

        const filters = getTextureFilters(supportsMipmaps);

        loadedImageTextures = loadedImages.map((img) =>
          createImageTexture(img, {
            anisotropy: maxAnisotropy,
            minFilter: filters.min,
            magFilter: filters.mag,
            generateMipmaps: supportsMipmaps,
          })
        );
      } catch (error) {
        console.error("Failed to load gallery textures", error);
        return;
      }

      if (!active) return;

      atlas = await createTextureAtlas(loadedImageTextures, {
        anisotropy: maxAnisotropy,
        useMipmaps: supportsMipmaps,
      });

      if (!active) return;

      setImageAtlas((previous) => {
        previous?.dispose();
        return atlas ?? null;
      });
    })();

    return () => {
      active = false;
      loadedImageTextures.forEach((texture) => texture.dispose());
      atlas?.dispose();
    };
  }, [items, maxAnisotropy, supportsMipmaps]);

  return { imageAtlas };
};

// Interaction handling
export const useGalleryInteractions = ({
  gl,
  itemsRef,
  uniformsRef,
  interactionRef,
  enabled,
  navigationEnabled,
  onSelectItem,
  onCloseFocus,
}: {
  gl: THREE.WebGLRenderer;
  itemsRef: MutableRefObject<GalleryItem[]>;
  uniformsRef: MutableRefObject<GalleryUniforms | null>;
  interactionRef: MutableRefObject<InteractionState>;
  enabled: boolean;
  navigationEnabled: boolean;
  onSelectItem?: (selection: FocusSelection) => void;
  onCloseFocus?: () => void;
}) => {
  useEffect(() => {
    if (!enabled) return;

    const canvas = gl.domElement;
    if (!canvas) return;

    let zoomTimeout: number | null = null;

    const setMouseUniform = (x: number, y: number) => {
      uniformsRef.current?.uMousePos.value.set(x, y);
    };

    const clearMouseUniform = () => setMouseUniform(-1, -1);

    const updateMouseUniform = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        clearMouseUniform();
        return;
      }

      setMouseUniform(e.clientX - rect.left, e.clientY - rect.top);
    };

    const startDrag = (e: PointerEvent) => {
      const state = interactionRef.current;

      // If focused (navigationEnabled is false), close focus on drag attempt
      if (!navigationEnabled) {
        onCloseFocus?.();
        return;
      }

      state.isDragging = navigationEnabled;
      state.isClick = true;
      state.clickStart = performance.now();
      state.previousMouse.set(e.clientX, e.clientY);
      if (navigationEnabled) {
        document.body.classList.add("dragging");
      }

      if (navigationEnabled) {
        zoomTimeout = window.setTimeout(() => {
          if (state.isDragging) {
            state.targetZoom = config.zoomLevel;
          }
        }, ZOOM_TRIGGER_DELAY_MS);
      }
    };

    const handleMove = (e: PointerEvent) => {
      updateMouseUniform(e);

      const state = interactionRef.current;
      if (!state.isDragging || !navigationEnabled) return;

      e.preventDefault();

      const deltaX = e.clientX - state.previousMouse.x;
      const deltaY = e.clientY - state.previousMouse.y;

      if (
        Math.abs(deltaX) > DRAG_THRESHOLD_PX ||
        Math.abs(deltaY) > DRAG_THRESHOLD_PX
      ) {
        state.isClick = false;
        if (state.targetZoom === 1) {
          state.targetZoom = config.zoomLevel;
        }
      }

      state.targetOffset.x -= deltaX * config.dragSpeed;
      state.targetOffset.y += deltaY * config.dragSpeed;
      state.previousMouse.set(e.clientX, e.clientY);
    };

    const openItemFromPointer = (e: PointerEvent) => {
      const selection = getSelectionFromPointer(
        e,
        canvas,
        interactionRef.current,
        itemsRef.current
      );
      if (selection) {
        onSelectItem?.(selection);
      }
    };

    const endDrag = (e: PointerEvent) => {
      const state = interactionRef.current;
      state.isDragging = false;
      state.targetZoom = 1;
      document.body.classList.remove("dragging");
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
        zoomTimeout = null;
      }

      const clickDuration = performance.now() - state.clickStart;
      if (state.isClick && clickDuration < CLICK_THRESHOLD_MS) {
        openItemFromPointer(e);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!canvas.contains(event.target as Node | null)) {
        return;
      }

      // If focused (navigationEnabled is false), close focus on scroll attempt
      if (!navigationEnabled) {
        event.preventDefault();
        onCloseFocus?.();
        return;
      }

      event.preventDefault();
      const state = interactionRef.current;
      state.isClick = false;

      const deltaModeFactor =
        event.deltaMode === 1
          ? DOM_DELTA_SCALE.line
          : event.deltaMode === 2
          ? DOM_DELTA_SCALE.page
          : 1;
      const deltaX = event.deltaX * deltaModeFactor;
      const deltaY = event.deltaY * deltaModeFactor;

      if (event.ctrlKey || event.metaKey) {
        const zoomDelta = -deltaY * config.wheelZoomFactor;
        state.targetZoom = clampZoomValue(state.targetZoom + zoomDelta);
      } else {
        state.targetOffset.x += deltaX * config.scrollSpeed;
        state.targetOffset.y -= deltaY * config.scrollSpeed;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      startDrag(e);
      updateMouseUniform(e);
    };

    const cancelMouse = () => {
      clearMouseUniform();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !navigationEnabled) {
        onCloseFocus?.();
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointerleave", cancelMouse);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointerleave", cancelMouse);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("dragging");
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }
    };
  }, [
    gl,
    itemsRef,
    uniformsRef,
    interactionRef,
    enabled,
    navigationEnabled,
    onSelectItem,
    onCloseFocus,
  ]);
};
