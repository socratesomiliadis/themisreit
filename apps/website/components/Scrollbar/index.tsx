"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Scrollbar() {
  const pathname = usePathname();
  const isWorkPage = pathname === "/work";
  const isHorizontal = isWorkPage;

  const pillRef = useRef<HTMLDivElement>(null!);
  const trackRef = useRef<HTMLDivElement>(null!);
  const lenis = useLenis();
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Dimensions for vertical scrollbar
  const trackHeight = 176; // h-44 = 176px
  const pillHeight = 48; // h-12 = 48px

  // Dimensions for horizontal scrollbar
  const trackWidth = 320; // w-80 = 320px
  const pillWidth = 80; // w-20 = 80px

  const showScrollbar = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 500); // Hide after 0.5 seconds of inactivity
  };

  useLenis(({ scroll, limit }) => {
    const progress = limit > 0 ? scroll / limit : 0;

    if (pillRef.current) {
      if (isHorizontal) {
        const maxTravel = trackWidth - pillWidth;
        pillRef.current.style.transform = `translateX(${
          progress * maxTravel
        }px)`;
      } else {
        const maxTravel = trackHeight - pillHeight;
        pillRef.current.style.transform = `translateY(${
          progress * maxTravel
        }px)`;
      }
    }

    // Show on scroll
    showScrollbar();
  });

  useEffect(() => {
    let isDragging = false;
    let startPos = 0;
    let startScrollProgress = 0;

    function onPointerDown(e: PointerEvent) {
      if (!lenis) return;
      e.preventDefault();
      isDragging = true;
      startPos = isHorizontal ? e.clientX : e.clientY;
      startScrollProgress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      document.documentElement.classList.add("scrollbar-grabbing");
      pillRef.current?.setPointerCapture(e.pointerId);
      showScrollbar();
    }

    function onPointerMove(e: PointerEvent) {
      // Check proximity to scrollbar
      if (!isDragging && trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        let distance: number;

        if (isHorizontal) {
          distance = Math.abs(e.clientY - rect.top);
        } else {
          distance = Math.abs(e.clientX - rect.left);
        }

        const proximityThreshold = 150; // Show when within 150px

        if (distance < proximityThreshold) {
          showScrollbar();
        }
      }

      if (!isDragging || !lenis || !trackRef.current) return;
      e.preventDefault();

      if (isHorizontal) {
        const deltaX = e.clientX - startPos;
        const maxTravel = trackWidth - pillWidth;
        const progressDelta = deltaX / maxTravel;
        const newProgress = Math.max(
          0,
          Math.min(1, startScrollProgress + progressDelta)
        );
        const newScroll = newProgress * lenis.limit;
        lenis.scrollTo(newScroll, { immediate: true });
      } else {
        const deltaY = e.clientY - startPos;
        const maxTravel = trackHeight - pillHeight;
        const progressDelta = deltaY / maxTravel;
        const newProgress = Math.max(
          0,
          Math.min(1, startScrollProgress + progressDelta)
        );
        const newScroll = newProgress * lenis.limit;
        lenis.scrollTo(newScroll, { immediate: true });
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!isDragging) return;
      e.preventDefault();
      isDragging = false;
      document.documentElement.classList.remove("scrollbar-grabbing");
      pillRef.current?.releasePointerCapture(e.pointerId);
    }

    const pill = pillRef.current;
    pill?.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      pill?.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [lenis, isHorizontal, trackHeight, pillHeight, trackWidth, pillWidth]);

  if (isWorkPage) {
    return null;
  }

  if (isHorizontal) {
    return (
      <div
        ref={trackRef}
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-1000 h-1 w-80 transition-opacity duration-300 mix-blend-exclusion",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Track/Background line */}
        <div className="absolute inset-0 bg-white/20 rounded-full" />

        {/* Moving pill indicator */}
        <div
          ref={pillRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 w-20 bg-white rounded-full will-change-transform cursor-grab hover:scale-y-180 transition-[scale] origin-center duration-300 ease-out active:cursor-grabbing"
        />
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-1000 w-1 h-44 transition-opacity duration-300 mix-blend-exclusion",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Track/Background line */}
      <div className="absolute inset-0 bg-white/20 rounded-full" />

      {/* Moving pill indicator */}
      <div
        ref={pillRef}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-12 bg-white rounded-full will-change-transform cursor-grab hover:scale-x-180 transition-[scale] origin-center duration-300 ease-out active:cursor-grabbing"
      />
    </div>
  );
}
