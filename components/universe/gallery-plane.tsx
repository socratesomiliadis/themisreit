"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { fragmentShader, vertexShader } from "@/lib/shaders";
import { config } from "./config";
import {
  useGalleryUniforms,
  useGalleryAtlases,
  useGalleryInteractions,
} from "./gallery-hooks";
import {
  getTextureFilters,
  loadImageElement,
  createCroppedHighResTexture,
} from "./texture-utils";
import {
  rgbaToArray,
  createInteractionState,
  buildHighResImageUrl,
} from "./gallery-utils";
import type { GalleryItem, FocusSelection } from "./types";

export const GalleryPlane = ({
  items,
  interactionEnabled,
  focusTarget,
  configVersion,
  enableHighResFocus,
  anisotropyCap,
  onSelectItem,
  onCloseFocus,
  onReady,
}: {
  items: GalleryItem[];
  interactionEnabled: boolean;
  focusTarget: FocusSelection | null;
  configVersion: number;
  enableHighResFocus: boolean;
  anisotropyCap: number;
  onSelectItem?: (selection: FocusSelection) => void;
  onCloseFocus?: () => void;
  onReady?: () => void;
}) => {
  const { gl, size } = useThree();
  const nativeAnisotropy = useMemo(
    () => gl.capabilities.getMaxAnisotropy?.() ?? 1,
    [gl]
  );
  const cappedAnisotropy = useMemo(
    () => Math.max(1, Math.min(nativeAnisotropy, anisotropyCap)),
    [anisotropyCap, nativeAnisotropy]
  );
  const supportsMipmaps = useMemo(
    () => Boolean(gl.capabilities.isWebGL2),
    [gl]
  );
  const { imageAtlas } = useGalleryAtlases(items, {
    maxAnisotropy: cappedAnisotropy,
    supportsMipmaps,
  });

  useEffect(() => {
    const bgColor = rgbaToArray(config.backgroundColor);
    gl.setClearColor(
      new THREE.Color(bgColor[0], bgColor[1], bgColor[2]),
      bgColor[3]
    );
  }, [gl]);

  const { uniforms, uniformsRef } = useGalleryUniforms({
    size,
    itemCount: items.length,
    imageAtlas,
    configVersion,
  });

  // Call onReady when uniforms are ready (textures loaded)
  useEffect(() => {
    if (uniforms && onReady) {
      // Small delay to ensure rendering has started
      const timer = setTimeout(() => {
        onReady();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [uniforms, onReady]);

  const interactionRef = useRef(createInteractionState());

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const freeViewRef = useRef({
    offset: new THREE.Vector2(),
    zoom: 1,
  });

  useEffect(() => {
    const state = interactionRef.current;
    if (focusTarget) {
      freeViewRef.current.offset.copy(state.targetOffset);
      freeViewRef.current.zoom = state.targetZoom;
      state.targetOffset.set(
        focusTarget.cellCenter.x,
        focusTarget.cellCenter.y - 0.15
      );
      state.targetZoom = config.focusTargetZoom;
      state.targetDistortionAmount = 0;
    } else {
      state.targetOffset.copy(freeViewRef.current.offset);
      state.targetZoom = freeViewRef.current.zoom;
      state.targetDistortionAmount = 1;
      state.targetFocusBlend = 0;
    }
  }, [focusTarget]);

  // Load high-res texture when focused
  useEffect(() => {
    if (!enableHighResFocus) {
      interactionRef.current.targetFocusBlend = 0;
      if (uniformsRef.current) {
        uniformsRef.current.uHighResTexture.value = null;
        uniformsRef.current.uFocusedIndex.value = -1;
      }
      return;
    }

    if (!focusTarget?.item.imageSource || !uniformsRef.current) {
      return;
    }

    const state = interactionRef.current;
    let active = true;
    let highResTexture: THREE.Texture | null = null;

    const highResUrl = buildHighResImageUrl(focusTarget.item.imageSource);
    if (!highResUrl) return;

    const focusedIndex = items.findIndex((item) => item.id === focusTarget.item.id);

    loadImageElement(highResUrl)
      .then((img) => {
        if (!active || !uniformsRef.current) return;

        const filters = getTextureFilters(supportsMipmaps);
        highResTexture = createCroppedHighResTexture(img, {
          anisotropy: cappedAnisotropy,
          minFilter: filters.min,
          magFilter: filters.mag,
          generateMipmaps: supportsMipmaps,
        });

        if (!highResTexture) {
          console.error("Failed to create cropped high-res texture");
          return;
        }

        uniformsRef.current.uHighResTexture.value = highResTexture;
        uniformsRef.current.uFocusedIndex.value = focusedIndex;
        state.targetFocusBlend = 1;
      })
      .catch((error) => {
        console.error("Failed to load high-res texture", error);
      });

    return () => {
      active = false;
      if (highResTexture) {
        highResTexture.dispose();
      }
      if (uniformsRef.current) {
        uniformsRef.current.uHighResTexture.value = null;
        uniformsRef.current.uFocusedIndex.value = -1;
      }
    };
  }, [
    focusTarget,
    items,
    uniformsRef,
    cappedAnisotropy,
    supportsMipmaps,
    enableHighResFocus,
  ]);

  useGalleryInteractions({
    gl,
    itemsRef,
    uniformsRef,
    interactionRef,
    enabled: Boolean(uniforms),
    navigationEnabled: interactionEnabled,
    onSelectItem,
    onCloseFocus,
  });

  useFrame((_, delta) => {
    const state = interactionRef.current;
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    const previousOffset = state.previousOffset.clone();
    state.offset.lerp(state.targetOffset, config.lerpFactor);
    state.zoom = THREE.MathUtils.lerp(
      state.zoom,
      state.targetZoom,
      config.lerpFactor
    );
    state.distortionAmount = THREE.MathUtils.lerp(
      state.distortionAmount,
      state.targetDistortionAmount,
      config.lerpFactor
    );
    state.focusBlend = THREE.MathUtils.lerp(
      state.focusBlend,
      state.targetFocusBlend,
      config.lerpFactor
    );

    const safeDelta = Math.max(delta, 1e-3);
    state.velocity
      .copy(state.offset)
      .sub(previousOffset)
      .divideScalar(safeDelta);

    uniforms.uOffset.value.copy(state.offset);
    uniforms.uZoom.value = state.zoom;
    uniforms.uVelocity.value.lerp(state.velocity, 0.5);
    uniforms.uDistortionAmount.value = state.distortionAmount;
    uniforms.uFocusBlend.value = state.focusBlend;
    state.previousOffset.copy(state.offset);
  });

  if (!uniforms) {
    return null;
  }

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={`shader-${imageAtlas?.uuid}`}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};
