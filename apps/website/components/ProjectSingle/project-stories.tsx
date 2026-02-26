"use client";

import { ProjectBySlugQueryResult } from "@/sanity.types";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { urlForAsset } from "@/lib/sanity/sanity.asset";
import { gsap } from "@/lib/gsap";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ScrambleIn from "../scramble-in";
import { cn, getContrastTextColor } from "@/lib/utils";
import { motion } from "motion/react";
import { PortableText } from "next-sanity";
import Player from "../VideoPlayer/player";
import { useLenis } from "lenis/react";

const DEFAULT_IMAGE_DURATION = 5; // 5 seconds for images

type Story = NonNullable<
  NonNullable<ProjectBySlugQueryResult>["stories"]
>[number];

interface ProjectStoriesContentProps {
  stories: readonly Story[];
  logo: NonNullable<ProjectBySlugQueryResult>["logo"];
  company: string;
  year: string;
  projectOrigin: NonNullable<ProjectBySlugQueryResult>["projectOrigin"];
  brandColor: string;
}

export function ProjectStoriesCursor({
  isPaused,
  cursorText,
  mousePosition,
  isHovering,
  className,
  brandColor,
}: {
  isPaused: boolean;
  cursorText: "NEXT" | "PREV";
  mousePosition: { x: number; y: number };
  isHovering: boolean;
  className?: string;
  brandColor: string;
}) {
  return (
    <motion.div
      layout="size"
      className={cn(
        "fixed z-50 pointer-events-none transition-opacity duration-200 font-some-type-mono",
        className
      )}
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        opacity: isHovering ? 1 : 0,
        backgroundColor: isPaused ? "#fff" : brandColor,
      }}
    >
      <div
        className="px-4 py-2 text-sm font-medium tracking-tight flex items-center gap-2 transition-colors duration-150"
        style={{
          color: isPaused ? "#434343" : getContrastTextColor(brandColor),
        }}
      >
        <ScrambleIn
          scrambleSpeed={75}
          scrambledLetterCount={2}
          text={isPaused ? "PAUSED" : cursorText}
          className="font-some-type-mono"
        />
        {isPaused ? (
          <span className="block w-2">
            <svg
              width="100%"
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.75 0C0.783502 0 0 0.783502 0 1.75V16.25C0 17.2165 0.783502 18 1.75 18H4.25C5.2165 18 6 17.2165 6 16.25V1.75C6 0.783502 5.2165 0 4.25 0H1.75Z"
                fill="currentColor"
              />
              <path
                d="M11.75 0C10.7835 0 10 0.783502 10 1.75V16.25C10 17.2165 10.7835 18 11.75 18H14.25C15.2165 18 16 17.2165 16 16.25V1.75C16 0.783502 15.2165 0 14.25 0H11.75Z"
                fill="currentColor"
              />
            </svg>
          </span>
        ) : (
          <span
            className={cn(
              "block w-2.5 transition-transform duration-300 ease-out",
              cursorText === "NEXT" ? "" : "-rotate-180"
            )}
          >
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
        )}
      </div>
    </motion.div>
  );
}

function ProjectStoriesContent({
  stories,
  logo,
  company,
  year,
  projectOrigin,
  brandColor,
}: ProjectStoriesContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState<"NEXT" | "PREV">("NEXT");
  const [isPaused, setIsPaused] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasHoldingRef = useRef(false);
  const lenis = useLenis();

  const currentStory = stories[currentIndex];
  const isVideo = !!currentStory?.video;

  // Get media URL
  const mediaUrl = isVideo
    ? urlForAsset(currentStory.video as any)
    : urlForImage(currentStory?.image as any)?.url();

  // Navigation handlers (with looping)
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  }, [stories.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  }, [stories.length]);

  // Handle hold to pause
  const handlePointerDown = useCallback(() => {
    wasHoldingRef.current = false;

    holdTimeoutRef.current = setTimeout(() => {
      wasHoldingRef.current = true;
      setIsPaused(true);
      tweenRef.current?.pause();
      videoRef.current?.pause();
    }, 150);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }

      if (isPaused) {
        setIsPaused(false);
        tweenRef.current?.resume();
        videoRef.current?.play();
        return;
      }

      // Only navigate if it wasn't a hold (short click)
      if (!wasHoldingRef.current && containerRef.current) {
        const clientX =
          "clientX" in e ? e.clientX : e.changedTouches?.[0]?.clientX ?? 0;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;

        if (x < rect.width / 2) {
          goToPrev();
        } else {
          goToNext();
        }
      }

      wasHoldingRef.current = false;
    },
    [isPaused, goToNext, goToPrev]
  );

  const handlePointerLeave = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isPaused) {
      setIsPaused(false);
      tweenRef.current?.resume();
      videoRef.current?.play();
    }
    wasHoldingRef.current = false;
  }, [isPaused]);

  // Track mouse position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setMousePosition({ x: e.clientX, y: e.clientY });
    setCursorText(x < rect.width / 2 ? "PREV" : "NEXT");
  }, []);

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    goToNext();
  }, [goToNext]);

  // Handle video time update for progress
  const handleVideoTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    const progressBar = progressBarsRef.current[currentIndex];
    if (video && progressBar && video.duration > 0) {
      const percent = (video.currentTime / video.duration) * 100;
      gsap.set(progressBar, { width: `${percent}%` });
    }
  }, [currentIndex]);

  // Set up progress animation
  useEffect(() => {
    // Kill previous tween
    tweenRef.current?.kill();

    const progressBar = progressBarsRef.current[currentIndex];
    if (!progressBar) return;

    // Reset current progress bar
    gsap.set(progressBar, { width: "0%" });

    // Reset all bars after current index
    progressBarsRef.current.forEach((bar, i) => {
      if (bar && i > currentIndex) {
        gsap.set(bar, { width: "0%" });
      }
      if (bar && i < currentIndex) {
        gsap.set(bar, { width: "100%" });
      }
    });

    // Only animate for images (videos use timeupdate)
    if (!isVideo) {
      tweenRef.current = gsap.to(progressBar, {
        width: "100%",
        duration: DEFAULT_IMAGE_DURATION,
        ease: "none",
        onComplete: goToNext,
      });
    }

    return () => {
      tweenRef.current?.kill();
    };
  }, [currentIndex, isVideo, goToNext]);

  // Reset video when story changes
  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [currentIndex, isVideo]);

  // Pause story video when overlay opens
  useEffect(() => {
    if (showVideoOverlay && videoRef.current) {
      lenis?.stop();
      videoRef.current.pause();
    } else {
      lenis?.start();
    }
  }, [lenis, showVideoOverlay]);

  // Close overlay on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showVideoOverlay) {
        setShowVideoOverlay(false);
        if (videoRef.current && isVideo) videoRef.current.play();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showVideoOverlay, isVideo]);

  const closeVideoOverlay = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      setShowVideoOverlay(false);
      if (videoRef.current && isVideo) {
        videoRef.current.play();
      }
    },
    [isVideo]
  );

  return (
    <>
      {" "}
      {/* Video Player Overlay */}
      {showVideoOverlay && isVideo && mediaUrl && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/90 p-4 cursor-auto"
          onPointerDown={closeVideoOverlay}
          onPointerUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full max-w-[70vw] aspect-video"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowVideoOverlay(false);
                if (videoRef.current && isVideo) videoRef.current.play();
              }}
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <Player url={mediaUrl} doAutoPlay={true} color={brandColor} />
          </div>
        </div>
      )}
      <section
        ref={containerRef}
        className="w-screen h-svh relative overflow-hidden select-none cursor-none z-10"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          handlePointerLeave();
        }}
        style={{
          clipPath: "inset(0% 0% 0% 0%)",
        }}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
      >
        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video
              ref={videoRef}
              key={currentStory._key}
              src={mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          ) : (
            <Image
              key={currentStory._key}
              src={mediaUrl ?? ""}
              alt=""
              fill
              className="object-cover"
              priority
            />
          )}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Progress Indicators */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[20%] flex flex-col gap-4">
          <div className="flex flex-row gap-1">
            {stories.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-[2px] bg-[#949494] rounded-full overflow-hidden"
              >
                <div
                  ref={(el) => {
                    progressBarsRef.current[index] = el;
                  }}
                  className="h-full bg-[#d3d3d3]"
                  style={{
                    width: index < currentIndex ? "100%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-10 rounded-full bg-black flex items-center justify-center overflow-hidden">
              {logo && (
                <Image
                  src={urlForImage(logo)?.width(80).height(80).url() ?? ""}
                  alt={company}
                  width={100}
                  height={100}
                  className="object-contain w-[60%] h-[40%] invert"
                />
              )}
            </div>
            <span className="text-white text-xl font-light tracking-tight">
              {company}
            </span>
          </div>
        </div>

        {/* Description - Bottom Left */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-[20%] text-white text-sm lg:text-2xl font-light">
          <PortableText value={currentStory.description ?? []} />
        </div>

        {/* Watch Video Button - only for video stories */}
        {isVideo && (
          <div
            className="absolute bottom-20 left-[55%] z-20 pointer-events-auto cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowVideoOverlay(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium transition-colors"
              aria-label="Watch video in full player"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch video
            </button>
          </div>
        )}

        {/* Mouse Follower Cursor */}
        {isHovering && (
          <ProjectStoriesCursor
            brandColor={brandColor}
            isPaused={isPaused}
            cursorText={cursorText}
            mousePosition={mousePosition}
            isHovering={isHovering}
          />
        )}
      </section>
    </>
  );
}

export default function ProjectStories({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData || !projectData.stories?.length) return null;

  const { stories, logo, company, year, projectOrigin, brandColor } =
    projectData;

  return (
    <ProjectStoriesContent
      brandColor={brandColor}
      stories={stories}
      logo={logo}
      company={company}
      year={year}
      projectOrigin={projectOrigin}
    />
  );
}
