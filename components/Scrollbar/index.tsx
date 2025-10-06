"use client";

import { useRect } from "hamo";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

export function Scrollbar() {
  const thumbRef = useRef<HTMLDivElement>(null!);
  const lenis = useLenis();
  const [innerMeasureRef, { height: innerHeight = 0 }] = useRect();

  const MIN_THUMB_PX = 48; // minimum visible size for usability

  function computeThumbHeight(trackHeight: number, scrollLimit: number) {
    const contentHeight = scrollLimit + trackHeight; // total scrollable content height
    if (contentHeight <= 0 || trackHeight <= 0) return MIN_THUMB_PX;
    const ratio = trackHeight / contentHeight; // viewport/content
    return Math.max(MIN_THUMB_PX, Math.round(ratio * trackHeight));
  }

  useLenis(
    ({ scroll, limit }) => {
      const progress = limit > 0 ? scroll / limit : 0;

      const thumbHeight = computeThumbHeight(innerHeight, limit);
      if (thumbRef.current) {
        thumbRef.current.style.height = `${thumbHeight}px`;
        thumbRef.current.style.transform = `translate3d(0,${
          progress * Math.max(0, innerHeight - thumbHeight)
        }px,0)`;
      }
    },
    [innerHeight]
  );

  useEffect(() => {
    // Set initial thumb height when sizes are known
    if (!thumbRef.current || !lenis) return;
    const thumbHeight = computeThumbHeight(innerHeight, lenis.limit);
    thumbRef.current.style.height = `${thumbHeight}px`;
  }, [lenis, innerHeight]);

  useEffect(() => {
    let start: null | number = null;

    function onPointerMove(e: PointerEvent) {
      if (start === null || !lenis) return;

      e.preventDefault();

      const thumbHeight = computeThumbHeight(innerHeight, lenis.limit);
      const trackRange = Math.max(1, innerHeight - thumbHeight);

      // Current thumb top in track coordinates (track starts at viewport top)
      const thumbTop = Math.min(Math.max(0, e.clientY - start), trackRange);
      const progress = thumbTop / trackRange;
      const scroll = progress * lenis.limit;

      lenis.scrollTo(scroll, { lerp: 0.2 });
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      start = e.offsetY;
      document.documentElement.classList.add("scrollbar-grabbing");
    }

    function onPointerUp() {
      start = null;
      document.documentElement.classList.remove("scrollbar-grabbing");
    }

    thumbRef.current?.addEventListener("pointerdown", onPointerDown, false);
    window.addEventListener("pointermove", onPointerMove, false);
    window.addEventListener("pointerup", onPointerUp, false);

    return () => {
      thumbRef.current?.removeEventListener(
        "pointerdown",
        onPointerDown,
        false
      );
      window.removeEventListener("pointermove", onPointerMove, false);
      window.removeEventListener("pointerup", onPointerUp, false);
    };
  }, [lenis, innerHeight]);

  return (
    <div className="fixed right-0 top-0 bottom-0 z-[1000]">
      <div ref={innerMeasureRef} className="inner h-full relative">
        <div
          className="thumb w-2 bg-[#c8c8c8]/50 backdrop-blur rounded-full absolute right-0 cursor-grab will-change-transform select-none"
          ref={(node) => {
            if (!node) return;
            thumbRef.current = node;
          }}
        />
      </div>
    </div>
  );
}
