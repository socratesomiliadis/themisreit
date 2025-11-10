"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { cn } from "@/lib/utils";
import { ProjectsQueryResult } from "@/sanity.types";

const COPIES = 5;
const CONFIG = {
  SCROLL_SPEED: 1.75,
  LERP_FACTOR: 0.05,
  MAX_VELOCITY: 150,
};

type SliderState = {
  currentX: number;
  targetX: number;
  slideWidth: number;
  isDragging: boolean;
  pointerId: number | null;
  pointerType: PointerEvent["pointerType"];
  startPointerX: number;
  lastPointerX: number;
  lastTargetX: number;
  dragDistance: number;
  hasActuallyDragged: boolean;
  lastScrollTime: number;
  lastCurrentX: number;
};

interface SlideProps {
  project: ProjectsQueryResult[0];
  slideRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLDivElement | null>;
  dragDistance: number;
  hasActuallyDragged: boolean;
  onSlideClick: () => void;
  isMobile: boolean;
}

function Slide({
  project,
  slideRef,
  imageRef,
  dragDistance,
  hasActuallyDragged,
  onSlideClick,
  isMobile,
}: SlideProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dragDistance < 10 && !hasActuallyDragged) {
      onSlideClick();
    }
  };

  return (
    <div
      ref={slideRef}
      onClick={handleClick}
      className={cn(
        "group shrink-0 relative overflow-visible flex flex-col cursor-pointer",
        "w-[16vw] h-auto aspect-11/16",
        "mx-6"
      )}
    >
      <div className="w-full h-full overflow-hidden flex items-center justify-center">
        <div
          ref={imageRef}
          className="w-auto aspect-video h-full will-change-transform"
        >
          <Image
            src={urlForImage(project.mainImage)?.url() ?? ""}
            alt={project.title}
            width={1920}
            height={1080}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        </div>
      </div>
      <div className="absolute -bottom-7 left-0 right-0 flex justify-between items-center pointer-events-none z-10 transition-opacity duration-300 slide-overlay text-white">
        <h2 className="uppercase font-medium text-lg project-title overflow-hidden leading-none flex relative">
          <span className="block whitespace-nowrap group-hover:-translate-y-full transition-transform duration-200 ease-out">
            {project.title}
          </span>
          <span className="block whitespace-nowrap absolute inset-0 translate-y-[90%] group-hover:translate-y-0 transition-transform duration-200 ease-out">
            {project.title}
          </span>
        </h2>
        <div className="size-3 project-arrow">
          <svg
            width="100%"
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.06978 1.94975L12.9693 1.94973L12.9693 11.8492M0.948451 13.9705L12.6157 2.3033"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSlider({
  projects,
}: {
  projects: ProjectsQueryResult;
}) {
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false);

  const totalSlideCount = projects.length;
  const totalSlides = totalSlideCount * COPIES;

  const slideRefs = useMemo(
    () =>
      Array.from({ length: totalSlides }, () =>
        React.createRef<HTMLDivElement | null>()
      ),
    [totalSlides]
  );

  const imageRefs = useMemo(
    () =>
      Array.from({ length: totalSlides }, () =>
        React.createRef<HTMLDivElement | null>()
      ),
    [totalSlides]
  );

  useEffect(() => {
    const slider = sliderRef.current;
    const track = trackRef.current;
    if (!slider || !track || !totalSlideCount) {
      return;
    }

    const state: SliderState = {
      currentX: 0,
      targetX: 0,
      slideWidth: 0,
      isDragging: false,
      pointerId: null,
      pointerType: "mouse",
      startPointerX: 0,
      lastPointerX: 0,
      lastTargetX: 0,
      dragDistance: 0,
      hasActuallyDragged: false,
      lastScrollTime: Date.now(),
      lastCurrentX: 0,
    };

    const updateMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    const measureSlideWidth = () => {
      const firstSlide = slideRefs[0]?.current;
      if (firstSlide) {
        const rect = firstSlide.getBoundingClientRect();
        const styles = window.getComputedStyle(firstSlide);
        const marginLeft = parseFloat(styles.marginLeft || "0");
        const marginRight = parseFloat(styles.marginRight || "0");
        state.slideWidth = rect.width + marginLeft + marginRight;
      } else {
        const mobile = window.innerWidth < 1000;
        state.slideWidth = mobile ? 215 : 390;
      }
    };

    const applyStartOffset = () => {
      const startOffset = -(totalSlideCount * state.slideWidth * 2);
      state.currentX = startOffset;
      state.targetX = startOffset;
      gsap.set(track, { x: startOffset });
    };

    const syncLayout = () => {
      updateMobile();
      measureSlideWidth();
      applyStartOffset();
    };

    syncLayout();
    requestAnimationFrame(() => {
      requestAnimationFrame(syncLayout);
    });

    const sequenceWidth = () => state.slideWidth * totalSlideCount;

    const clampVelocity = (value: number) =>
      Math.max(Math.min(value, CONFIG.MAX_VELOCITY), -CONFIG.MAX_VELOCITY);

    const updateWrap = () => {
      const width = sequenceWidth();
      if (!width) return;

      if (state.currentX > -width) {
        state.currentX -= width;
        state.targetX -= width;
      } else if (state.currentX < -width * 4) {
        state.currentX += width;
        state.targetX += width;
      }
    };

    const updateParallax = () => {
      const viewportCenter = window.innerWidth / 2;
      imageRefs.forEach((imageRef, index) => {
        const slideRef = slideRefs[index];
        if (!slideRef?.current || !imageRef?.current) return;
        const slideRect = slideRef.current.getBoundingClientRect();
        if (
          slideRect.right < -500 ||
          slideRect.left > window.innerWidth + 500
        ) {
          return;
        }

        const slideCenter = slideRect.left + slideRect.width / 2;
        const distance = slideCenter - viewportCenter;
        const offset = distance * -0.25;
        const img = imageRef.current.querySelector("img");
        if (img) {
          gsap.set(img, {
            x: offset,
            // scale: 2.25
          });
        }
      });
    };

    const updateMotionFlag = () => {
      const velocity = Math.abs(state.currentX - state.lastCurrentX);
      state.lastCurrentX = state.currentX;
      const isSlow = velocity < 0.1;
      const stillLongEnough = Date.now() - state.lastScrollTime > 200;
      const moving = state.hasActuallyDragged || !isSlow || !stillLongEnough;
      document.documentElement.style.setProperty(
        "--slider-moving",
        moving ? "1" : "0"
      );
    };

    let rafId = 0;
    const tick = () => {
      state.currentX += (state.targetX - state.currentX) * CONFIG.LERP_FACTOR;
      updateWrap();
      gsap.set(track, { x: state.currentX });
      updateMotionFlag();
      updateParallax();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const startDrag = (
      clientX: number,
      pointerId: number,
      pointerType: PointerEvent["pointerType"]
    ) => {
      state.isDragging = true;
      state.pointerId = pointerId;
      state.pointerType = pointerType;
      state.startPointerX = clientX;
      state.lastPointerX = clientX;
      state.lastTargetX = state.targetX;
      state.dragDistance = 0;
      state.hasActuallyDragged = false;
      setDragDistance(0);
      setHasActuallyDragged(false);
      state.lastScrollTime = Date.now();
    };

    const finishDrag = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      state.pointerId = null;
      setTimeout(() => {
        state.hasActuallyDragged = false;
        setHasActuallyDragged(false);
        setDragDistance(0);
      }, 100);
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      state.lastScrollTime = Date.now();
      state.targetX -= clampVelocity(event.deltaY * CONFIG.SCROLL_SPEED);
    };

    const handlePointerDown = (event: PointerEvent) => {
      slider.setPointerCapture(event.pointerId);
      startDrag(event.clientX, event.pointerId, event.pointerType);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!state.isDragging || state.pointerId !== event.pointerId) return;
      event.preventDefault();
      state.lastScrollTime = Date.now();

      if (state.pointerType === "touch") {
        const delta = (event.clientX - state.startPointerX) * 1.5;
        state.targetX = state.lastTargetX + delta;
        state.dragDistance = Math.abs(delta);
      } else {
        const delta = (event.clientX - state.lastPointerX) * 2;
        state.targetX += delta;
        state.lastPointerX = event.clientX;
        state.dragDistance += Math.abs(delta);
      }

      setDragDistance(state.dragDistance);

      if (state.dragDistance > 5 && !state.hasActuallyDragged) {
        state.hasActuallyDragged = true;
        setHasActuallyDragged(true);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (state.pointerId !== event.pointerId) return;
      if (slider.hasPointerCapture(event.pointerId)) {
        slider.releasePointerCapture(event.pointerId);
      }
      finishDrag();
    };

    const handleResize = () => {
      const previousOffset = state.currentX;
      const previousWidth = sequenceWidth() || 1;
      syncLayout();
      const currentWidth = sequenceWidth() || 1;
      const relative = previousWidth ? previousOffset % previousWidth : 0;
      const startOffset = -(totalSlideCount * state.slideWidth * 2);
      state.currentX = startOffset + relative;
      state.targetX = state.currentX;
      state.lastTargetX = state.currentX;
      gsap.set(track, { x: state.currentX });
      if (currentWidth === previousWidth) {
        updateParallax();
      }
    };

    const preventDrag = (event: Event) => event.preventDefault();

    slider.addEventListener("wheel", handleWheel, { passive: false });
    slider.addEventListener("pointerdown", handlePointerDown);
    slider.addEventListener("pointermove", handlePointerMove);
    slider.addEventListener("pointerup", handlePointerUp);
    slider.addEventListener("pointerleave", handlePointerUp);
    slider.addEventListener("pointercancel", handlePointerUp);
    slider.addEventListener("dragstart", preventDrag);
    window.addEventListener("resize", handleResize);

    return () => {
      slider.removeEventListener("wheel", handleWheel);
      slider.removeEventListener("pointerdown", handlePointerDown);
      slider.removeEventListener("pointermove", handlePointerMove);
      slider.removeEventListener("pointerup", handlePointerUp);
      slider.removeEventListener("pointerleave", handlePointerUp);
      slider.removeEventListener("pointercancel", handlePointerUp);
      slider.removeEventListener("dragstart", preventDrag);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [imageRefs, slideRefs, totalSlideCount]);

  return (
    <div
      ref={sliderRef}
      className="relative w-screen h-svh overflow-hidden select-none slider flex items-center justify-center"
    >
      <div
        ref={trackRef}
        className="absolute w-full h-full flex slide-track items-center"
      >
        {slideRefs.length > 0 &&
          imageRefs.length > 0 &&
          Array.from({ length: totalSlides }).map((_, i) => {
            const dataIndex = i % totalSlideCount;
            const slideRef = slideRefs[i];
            const imageRef = imageRefs[i];

            return (
              <Slide
                key={i}
                project={projects[dataIndex]}
                slideRef={slideRef}
                imageRef={imageRef}
                dragDistance={dragDistance}
                hasActuallyDragged={hasActuallyDragged}
                onSlideClick={() => {
                  router.push(`/work/${projects[dataIndex].slug.current}`);
                }}
                isMobile={isMobile}
              />
            );
          })}
      </div>
    </div>
  );
}
