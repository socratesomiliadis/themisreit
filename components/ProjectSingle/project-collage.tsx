"use client";

import { cn } from "@/lib/utils";
import { urlForImage } from "@/lib/sanity/sanity.image";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

type CollageImage = {
  asset?: {
    _ref?: string;
    _type: "reference";
  };
  _type: "image";
};

type CollageItem = {
  _key: string;
  image?: CollageImage;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  aspectRatio?: number;
};

type ProjectCollageProps = {
  items: CollageItem[];
  className?: string;
  /** 0 = no parallax, 1 = full effect. Default 1. */
  parallaxIntensity?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const COLLAGE_CANVAS_ASPECT = 25 / 9;
const PADDING_PIXELS = 48;

function CollageLayer({
  item,
  index,
  canvasAspect,
  dragX,
  parallaxFactor,
}: {
  item: CollageItem;
  index: number;
  canvasAspect: number;
  dragX: ReturnType<typeof useMotionValue<number>>;
  parallaxFactor: number;
}) {
  const x = clamp(item.x ?? 0, 0, 100);
  const y = clamp(item.y ?? 0, 0, 100);
  const width = clamp(item.width ?? 22, 1, 100);
  const ratio =
    typeof item.aspectRatio === "number" &&
    Number.isFinite(item.aspectRatio) &&
    item.aspectRatio > 0
      ? item.aspectRatio
      : 1;
  const height = clamp((width * canvasAspect) / ratio, 1, 100);
  const zIndex = item.zIndex ?? index + 1;

  const assetRef = item.image?.asset?._ref;
  const imageUrl = assetRef
    ? urlForImage({
        _type: "image",
        asset: {
          _type: "reference",
          _ref: assetRef,
        },
      })
        ?.width(1800)
        .url()
    : "";

  const parallaxOffset = useTransform(
    dragX,
    (latest) => latest * (parallaxFactor - 1)
  );

  if (!imageUrl) {
    return null;
  }

  return (
    <motion.div
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        zIndex,
        x: parallaxOffset,
        backfaceVisibility: "hidden" as const,
      }}
      className="absolute overflow-hidden isolate will-change-transform"
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-cover select-none pointer-events-none"
        sizes="(max-width: 1280px) 40vw, 28vw"
        draggable={false}
      />
    </motion.div>
  );
}

export default function ProjectCollage({
  items,
  className,
  parallaxIntensity = 0.5,
}: ProjectCollageProps) {
  const sortedItems = useMemo(
    () => items.slice().sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)),
    [items]
  );
  const validItems = useMemo(
    () => sortedItems.filter((item) => item?.image?.asset?._ref),
    [sortedItems]
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragRange, setDragRange] = useState(120);
  const canvasAspect = COLLAGE_CANVAS_ASPECT;

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    const viewport = viewportRef.current;
    const updateDragRange = () => {
      const viewportWidth = viewport.clientWidth;
      const nextRange = viewportWidth * 0.35 + PADDING_PIXELS;
      setDragRange(nextRange);
    };

    updateDragRange();
    const observer = new ResizeObserver(updateDragRange);
    observer.observe(viewport);
    window.addEventListener("resize", updateDragRange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDragRange);
    };
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    gsap.to(cursorRef.current, {
      left: event.clientX,
      top: event.clientY,
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  if (validItems.length === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={cursorRef}
        className={cn(
          "fixed size-14 gap-2 bg-white border border-[#434343]/20 shadow-[0_0_0_3px_#fff] rounded-full flex flex-row items-center justify-center pointer-events-none text-black z-100 transition-opacity duration-200 ease-out",
          !isHovered && "opacity-0"
        )}
      >
        <span className="w-3 flex items-center justify-center">
          <svg
            width="100%"
            viewBox="0 0 7 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M-1.15007e-07 2.63065C-2.30293e-07 2.55588 0.0296999 2.48418 0.0825665 2.43132L2.43174 0.0821332C2.54183 -0.0279561 2.72032 -0.0279566 2.83041 0.0821327C2.9405 0.192222 2.9405 0.370711 2.83041 0.480801L0.962469 2.34875L6.48372 2.34875C6.63941 2.34875 6.76562 2.47496 6.76562 2.63065C6.76562 2.78634 6.63941 2.91255 6.48372 2.91255L0.962472 2.91255L2.83041 4.78048C2.9405 4.89057 2.9405 5.06906 2.83041 5.17915C2.72032 5.28924 2.54183 5.28924 2.43174 5.17915L0.0825671 2.82998C0.0297003 2.77712 2.78117e-10 2.70541 -1.15007e-07 2.63065Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="w-3 flex items-center justify-center">
          <svg
            width="100%"
            viewBox="0 0 7 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.76562 2.63107C6.76563 2.70583 6.73593 2.77754 6.68306 2.8304L4.33388 5.17959C4.22379 5.28967 4.0453 5.28968 3.93521 5.17959C3.82513 5.0695 3.82513 4.89101 3.93521 4.78092L5.80316 2.91297L0.281901 2.91297C0.126212 2.91297 0 2.78676 0 2.63107C0 2.47538 0.126212 2.34917 0.281901 2.34917L5.80315 2.34917L3.93521 0.481235C3.82513 0.371146 3.82513 0.192657 3.93521 0.0825672C4.0453 -0.0275222 4.22379 -0.0275224 4.33388 0.0825666L6.68306 2.43174C6.73592 2.4846 6.76562 2.5563 6.76562 2.63107Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
      <div
        ref={viewportRef}
        className={cn("relative mt-8 w-[130vw] ml-[10vw] z-10", className)}
        style={{ aspectRatio: "25 / 9" }}
      >
        <motion.div
          drag="x"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            x: dragX,
            backfaceVisibility: "hidden",
          }}
          dragConstraints={{ left: -dragRange, right: PADDING_PIXELS }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={() => {
            setIsDragging(true);
            gsap.to(cursorRef.current, {
              scale: 0.8,
              duration: 0.2,
              ease: "power2.out",
            });
          }}
          onDragEnd={() => {
            setIsDragging(false);
            gsap.to(cursorRef.current, {
              scale: 1,
              duration: 0.2,
              ease: "power2.in",
            });
          }}
          className={cn(
            "relative h-full w-full cursor-grab",
            isDragging && "cursor-grabbing"
          )}
        >
          {validItems.map((item, idx) => {
            const intensity = clamp(parallaxIntensity, 0, 1);
            const parallaxFactor =
              1 +
              intensity *
                (-0.4 + (idx / Math.max(validItems.length - 1, 1)) * 0.8);
            return (
              <CollageLayer
                key={item._key}
                item={item}
                index={idx}
                canvasAspect={canvasAspect}
                dragX={dragX}
                parallaxFactor={parallaxFactor}
              />
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
