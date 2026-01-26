"use client";

import { ProjectBySlugQueryResult } from "@/sanity.types";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { urlForAsset } from "@/lib/sanity/sanity.asset";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_IMAGE_DURATION = 5000; // 5 seconds for images

type Story = NonNullable<ProjectBySlugQueryResult>["stories"][number];

interface ProjectStoriesContentProps {
  stories: readonly Story[];
  logo: NonNullable<ProjectBySlugQueryResult>["logo"];
  company: string;
  year: string;
  projectOrigin: NonNullable<ProjectBySlugQueryResult>["projectOrigin"];
}

function ProjectStoriesContent({
  stories,
  logo,
  company,
  year,
  projectOrigin,
}: ProjectStoriesContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState<"NEXT" | "PREV">("NEXT");
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const wasHoldingRef = useRef(false);
  const imageStartTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  const currentStory = stories[currentIndex];
  const isVideo = !!currentStory?.video;

  // Get media URL
  const mediaUrl = isVideo
    ? urlForAsset(currentStory.video as any)
    : urlForImage(currentStory?.image as any)?.url();

  // Navigation handlers (with looping)
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
    setProgress(0);
  }, [stories.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    setProgress(0);
  }, [stories.length]);

  // Handle hold to pause
  const handlePointerDown = useCallback(() => {
    holdStartTimeRef.current = Date.now();
    wasHoldingRef.current = false;

    // Set a timeout to detect hold (150ms threshold)
    const holdTimeout = setTimeout(() => {
      wasHoldingRef.current = true;
      setIsPaused(true);
      elapsedBeforePauseRef.current =
        Date.now() - imageStartTimeRef.current + elapsedBeforePauseRef.current;

      // Pause video if playing
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }, 150);

    // Store timeout to clear on pointer up
    (containerRef.current as any)._holdTimeout = holdTimeout;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Clear hold timeout
      if ((containerRef.current as any)?._holdTimeout) {
        clearTimeout((containerRef.current as any)._holdTimeout);
      }

      // Resume if was paused
      if (isPaused) {
        setIsPaused(false);
        // Resume video if it was paused
        if (videoRef.current?.paused) {
          videoRef.current.play();
        }
      }

      // Only navigate if it wasn't a hold (short click)
      if (!wasHoldingRef.current && containerRef.current) {
        const clientX =
          "clientX" in e ? e.clientX : (e.changedTouches?.[0]?.clientX ?? 0);
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const isLeftSide = x < rect.width / 2;

        if (isLeftSide) {
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
    // Clear hold timeout and resume if user leaves while holding
    if ((containerRef.current as any)?._holdTimeout) {
      clearTimeout((containerRef.current as any)._holdTimeout);
    }
    if (isPaused) {
      setIsPaused(false);
      if (videoRef.current?.paused) {
        videoRef.current.play();
      }
    }
    wasHoldingRef.current = false;
  }, [isPaused]);

  // Track mouse position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setMousePosition({ x: e.clientX, y: e.clientY });

    const isLeftSide = x < rect.width / 2;
    setCursorText(isLeftSide ? "PREV" : "NEXT");
  }, []);

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    goToNext();
  }, [goToNext]);

  // Handle video time update for progress
  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  }, []);

  // Auto-advance for images (with pause support)
  useEffect(() => {
    // Clear existing timers
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }

    // Don't run timers if paused or if it's a video
    if (isPaused || isVideo) {
      return;
    }

    // Calculate remaining time based on elapsed time before pause
    const remainingTime =
      DEFAULT_IMAGE_DURATION - elapsedBeforePauseRef.current;
    imageStartTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed =
        Date.now() - imageStartTimeRef.current + elapsedBeforePauseRef.current;
      const newProgress = (elapsed / DEFAULT_IMAGE_DURATION) * 100;
      setProgress(Math.min(newProgress, 100));
    }, 50);

    autoAdvanceTimeoutRef.current = setTimeout(() => {
      elapsedBeforePauseRef.current = 0; // Reset for next story
      goToNext();
    }, remainingTime);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [currentIndex, isVideo, isPaused, goToNext]);

  // Reset elapsed time when story changes
  useEffect(() => {
    elapsedBeforePauseRef.current = 0;
  }, [currentIndex]);

  // Reset video when story changes
  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [currentIndex, isVideo]);

  return (
    <section
      ref={containerRef}
      className="w-screen h-svh relative overflow-hidden cursor-none select-none z-10"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        handlePointerLeave();
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
      <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 w-[20%] flex flex-col gap-4">
        <div className="flex flex-row gap-1">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-[2px] bg-[#949494] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-[#CCCCCC] transition-all duration-100 ease-linear"
                style={{
                  width:
                    index < currentIndex
                      ? "100%"
                      : index === currentIndex
                        ? `${progress}%`
                        : "0%",
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
                className="object-contain w-[60%]"
              />
            )}
          </div>
          <span className="text-white text-xl font-light tracking-tight">
            {company}
          </span>
        </div>
      </div>

      {/* Description - Bottom Left */}
      <div className="absolute bottom-12 left-12 z-10 max-w-md">
        <p className="text-white/80 text-sm lg:text-base font-light italic leading-relaxed">
          {currentStory.description}
        </p>
        <p className="text-white/60 text-xs lg:text-sm mt-2">
          {projectOrigin?.subbrand}. ({year})
        </p>
      </div>

      {/* Mouse Follower Cursor */}
      <div
        className="fixed z-50 pointer-events-none transition-opacity duration-200"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          opacity: isHovering ? 1 : 0,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className={`px-4 py-2 text-xs font-medium tracking-wider flex items-center gap-2 transition-colors duration-150 ${
            isPaused
              ? "bg-white/90 text-[#434343]"
              : "bg-[#28f300] text-[#434343]"
          }`}
        >
          {isPaused ? (
            <>
              <span className="text-sm">⏸</span>
              <span>PAUSED</span>
            </>
          ) : (
            <>
              <span>{cursorText}</span>
              <span className="text-sm">
                {cursorText === "NEXT" ? "→" : "←"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Story Counter - Bottom Right */}
      <div className="absolute bottom-12 right-12 z-10">
        <span className="text-white/60 text-sm font-light">
          {String(currentIndex + 1).padStart(2, "0")} /{" "}
          {String(stories.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}

export default function ProjectStories({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData || !projectData.stories?.length) return null;

  const { stories, logo, company, year, projectOrigin } = projectData;

  return (
    <ProjectStoriesContent
      stories={stories}
      logo={logo}
      company={company}
      year={year}
      projectOrigin={projectOrigin}
    />
  );
}
