import { urlForImage } from "@/lib/sanity/sanity.image";
import { ProjectBySlugQueryResult } from "@/sanity.types";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ProjectStoriesCursor } from "./project-stories";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ProjectFrames({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;

  const [activeFrame, setActiveFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState<"NEXT" | "PREV">("NEXT");
  const { frames, brandColor } = projectData;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setMousePosition({ x: e.clientX, y: e.clientY });
    setCursorText(x < rect.width / 2 ? "PREV" : "NEXT");
  }, []);

  const handleClick = useCallback(() => {
    gsap.fromTo(
      ".frames-cursor",
      {
        scale: 0.85,
      },
      {
        scale: 1,
        duration: 0.4,
        yoyo: true,
        // repeat: 1,
        ease: "power2.out",
      }
    );
    if (cursorText === "NEXT") {
      setActiveFrame((prev) => (prev + 1) % frames?.length);
    } else {
      setActiveFrame((prev) => (prev - 1 + frames?.length) % frames?.length);
    }
  }, [frames?.length, cursorText]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      style={{
        clipPath: "inset(0% 0% 0% 0%)",
      }}
      onClick={handleClick}
      className="w-screen h-screen relative z-10 cursor-none select-none"
    >
      <ProjectStoriesCursor
        isPaused={false}
        cursorText={cursorText}
        mousePosition={mousePosition}
        isHovering={isHovering}
        className="frames-cursor transition-transform duration-300 ease-out"
      />
      <div className="absolute left-24 top-24 z-50 flex flex-row items-center gap-4 text-white">
        <span style={{ backgroundColor: brandColor }} className="size-3"></span>
        <span className="text-4xl font-light">Video Frames</span>
      </div>
      <div className="absolute right-24 top-24 z-50 flex flex-row items-center gap-0 text-white leading-[0.85]">
        {frames?.map((frame, index) => (
          <div
            key={frame._key}
            className="text-[10rem] flex overflow-hidden relative"
          >
            <span
              className={cn(
                "transition-transform duration-300 ease-out",
                activeFrame === index && "-translate-y-full"
              )}
            >
              {index + 1}
            </span>
            <span
              style={{ color: brandColor }}
              className={cn(
                "absolute translate-y-full transition-transform duration-300 ease-out",
                activeFrame === index && "translate-y-0"
              )}
            >
              {index + 1}
            </span>
          </div>
        ))}
      </div>
      {frames?.map((frame, index) => (
        <div
          key={frame._key}
          className={cn(
            "absolute top-0 left-0 w-full h-full z-0",
            activeFrame === index && "z-1"
          )}
        >
          <Image
            src={urlForImage(frame)?.url() ?? ""}
            alt=""
            onLoad={() => {
              if (index === 0) ScrollTrigger.refresh();
            }}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </section>
  );
}
