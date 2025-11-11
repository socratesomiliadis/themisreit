"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ProjectsQueryResult } from "@/sanity.types";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import MinimapScrollbar from "./minimap-scrollbar";

interface SlideProps {
  project: ProjectsQueryResult[0];
  slideRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLDivElement | null>;
  dataIndex: number;
  setActiveIndex: (index: number) => void;
}

function Slide({
  project,
  slideRef,
  imageRef,
  dataIndex,
  setActiveIndex,
}: SlideProps) {
  useIsomorphicLayoutEffect(() => {
    ScrollTrigger.create({
      trigger: slideRef.current,
      horizontal: true,
      start: "left center",
      end: "right center",
      onEnter: () => setActiveIndex(dataIndex),
      onEnterBack: () => setActiveIndex(dataIndex),
    });
  }, []);

  return (
    <div
      ref={slideRef}
      className={cn(
        "group relative overflow-visible flex flex-col cursor-pointer",
        "h-auto aspect-12/16 w-[20vw]"
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
    </div>
  );
}

export default function ProjectsSliderNew({
  projects,
}: {
  projects: ProjectsQueryResult;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const duplicatedProjects = [...projects, ...projects];

  const totalSlides = duplicatedProjects.length;

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
    if (!slideRefs.length || !imageRefs.length) return;

    const updateParallax = () => {
      const viewportCenter = window.innerWidth / 2;
      imageRefs.forEach((imageRef, index) => {
        const slideRef = slideRefs[index];
        if (!slideRef?.current || !imageRef?.current) return;
        const slideRect = slideRef.current.getBoundingClientRect();

        // Skip offscreen slides for performance
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
          });
        }
      });
    };

    let rafId: number;
    const tick = () => {
      updateParallax();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [imageRefs, slideRefs]);

  return (
    <div className="h-svh relative flex items-center justify-center w-fit bg-[#111111]">
      <MinimapScrollbar projects={projects} activeIndex={activeIndex} />
      <div className="flex items-center gap-[1vw] w-[200vw] overflow-hidden">
        {duplicatedProjects.map((project, index) => {
          const dataIndex = index % projects.length;
          return (
            <Slide
              key={index}
              project={project}
              slideRef={slideRefs[index]}
              imageRef={imageRefs[index]}
              dataIndex={dataIndex}
              setActiveIndex={setActiveIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
