"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import TransitionLink from "@/components/transition-link";
import { ProjectsQueryResult } from "@/sanity.types";
import { config } from "./config";
import { buildGalleryItems, rgbaToArray } from "./gallery-utils";
import { useResponsiveGalleryRuntime } from "./gallery-hooks";
import { GalleryPlane } from "./gallery-plane";
import type { FocusSelection } from "./types";
import { cn } from "@/lib/utils";
import Frame from "../SVGs/frame";

export default function InfiniteGallery({
  projects,
}: {
  projects: ProjectsQueryResult;
}) {
  const {
    configVersion,
    dpr,
    maxVisibleItems,
    allowHighResFocus,
    anisotropyCap,
    focusEnabled,
  } = useResponsiveGalleryRuntime();

  const [focusedSelection, setFocusedSelection] =
    useState<FocusSelection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Start rendering after a brief moment to ensure loading screen shows first
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectItem = useCallback(
    (selection: FocusSelection) => {
      if (!focusEnabled) return;
      setFocusedSelection((current) =>
        current?.item.id === selection.item.id ? null : selection
      );
    },
    [focusEnabled]
  );

  const handleCloseFocus = useCallback(() => {
    setFocusedSelection(null);
  }, []);

  const galleryItems = useMemo(() => buildGalleryItems(projects), [projects]);

  const visibleItems = useMemo(() => {
    if (!maxVisibleItems || maxVisibleItems >= galleryItems.length) {
      return galleryItems;
    }
    return galleryItems.slice(0, maxVisibleItems);
  }, [galleryItems, maxVisibleItems]);

  useEffect(() => {
    if (!focusEnabled && focusedSelection) {
      setFocusedSelection(null);
    }
  }, [focusEnabled, focusedSelection]);

  useEffect(() => {
    if (
      focusedSelection &&
      !visibleItems.some((item) => item.id === focusedSelection.item.id)
    ) {
      setFocusedSelection(null);
    }
  }, [focusedSelection, visibleItems]);

  if (!visibleItems.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p>No projects available. Total projects: {projects.length}</p>
      </div>
    );
  }

  return (
    <>
      {/* Loading Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center transition-[opacity, scale] duration-500 ease-in-out-circ",
          isReady
            ? "opacity-0 pointer-events-none scale-50"
            : "opacity-100 scale-100"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-9">
            <div className="absolute inset-0 border-2 border-tsioulka-gold/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-tsioulka-gold rounded-full animate-spin"></div>
          </div>
          <p className="font-bonky text-xl text-tsioulka-gold/80 animate-pulse">
            Loading Universe...
          </p>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 w-full h-full transition-opacity duration-600 ease-in-out-circ",
          isReady ? "opacity-100" : "opacity-0"
        )}
        id="gallery"
      >
        {shouldRender && (
          <Canvas
            orthographic
            dpr={dpr}
            camera={{
              position: [0, 0, 1],
              near: 0.1,
              far: 10,
              zoom: 1,
              left: -1,
              right: 1,
              top: 1,
              bottom: -1,
            }}
            gl={{
              antialias: true,
              alpha: false,
              preserveDrawingBuffer: false,
              powerPreference: "high-performance",
            }}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              touchAction: "none",
              backgroundColor: "rgb(245, 245, 245)",
            }}
            onCreated={(state) => {
              const [r = 1, g = 1, b = 1, a = 1] =
                rgbaToArray(config.backgroundColor);
              state.gl.setClearColor(new THREE.Color(r, g, b), a);
            }}
          >
            <Suspense fallback={null}>
              <GalleryPlane
                items={visibleItems}
                interactionEnabled={focusEnabled ? !focusedSelection : true}
                focusTarget={focusEnabled ? focusedSelection : null}
                configVersion={configVersion}
                enableHighResFocus={focusEnabled && allowHighResFocus}
                anisotropyCap={anisotropyCap}
                onSelectItem={handleSelectItem}
                onCloseFocus={handleCloseFocus}
                onReady={() => setIsReady(true)}
              />
            </Suspense>
          </Canvas>
        )}
        {focusEnabled && focusedSelection && (
          <FocusOverlay
            selection={focusedSelection}
            onClose={handleCloseFocus}
          />
        )}
      </div>
    </>
  );
}

function FocusOverlay({
  selection,
  onClose,
}: {
  selection: FocusSelection;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between ">
      <div className="pointer-events-auto flex justify-center py-14.5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-tsioulka-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-tsioulka-gold transition hover:border-tsioulka-gold/50 hover:text-tsioulka-gold/50 cursor-pointer"
        >
          Close
        </button>
      </div>
      <div className="pointer-events-none flex flex-col items-center gap-3 pb-8 text-center text-[#434343]">
        <p className="text-4xl tracking-tight leading-none">
          {selection.item.title}
        </p>

        <TransitionLink
          href={`/work/${selection.item.slug}`}
          className="pointer-events-auto px-5 py-2 font-some-type-mono text-sm uppercase bg-[#434343] text-white"
        >
          View Project
        </TransitionLink>
      </div>
    </div>
  );
}
