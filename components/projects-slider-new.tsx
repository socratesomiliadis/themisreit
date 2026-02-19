"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ProjectsQueryResult } from "@/sanity.types";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import MinimapScrollbar from "./minimap-scrollbar";
import { useLenis } from "lenis/react";
import { useRouter } from "next/navigation";
import { ProjectItem } from "./Home/home-projects";

interface SlideProps {
  project: ProjectsQueryResult[0];
  index: number;
  slideRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLDivElement | null>;
  dataIndex: number;
  setActiveIndex: (index: number) => void;
  setOpen: (index: number | null) => void;
}

function Slide({
  project,
  index,
  slideRef,
  imageRef,
  dataIndex,
  setActiveIndex,
  setOpen,
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
      onClick={() => {
        setOpen(index);
      }}
      className={cn(
        "group relative overflow-visible flex flex-col cursor-pointer work-slide",
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
      <div className="absolute z-10 left-0 -bottom-8 w-full overflow-hidden">
        <span className="text-[#434343] text-xl tracking-tighter translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 ease-out block">
          {project.title}
        </span>
      </div>
    </div>
  );
}

export default function ProjectsSliderNew({
  projects,
}: {
  projects: ProjectsQueryResult;
}) {
  const router = useRouter();
  const lenis = useLenis();
  const [open, setOpen] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const duplicatedProjects = [...projects, ...projects];

  const totalSlides = duplicatedProjects.length;

  const openDataIndex = useMemo(() => {
    return open ? open % projects.length : 0;
  }, [open, projects]);

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

  useIsomorphicLayoutEffect(() => {
    if (open === null) return;
    const slideRef = slideRefs[open];
    if (!slideRef?.current) return;
    const dataIndex = open % projects.length;
    const openTl = gsap.timeline({
      onComplete: () => {
        router.push(`/work/${projects[dataIndex].slug.current}`);
      },
    });
    openTl.to(".work-slide", {
      y: "-200%",
      stagger: {
        each: 0.06,
        from: open,
      },
      duration: 1,
    });
    openTl.fromTo(
      ".work-open-item",
      {
        clipPath: "inset(0% 100% 0% 0%)",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.2,
      },
      0.3
    );
    openTl.to(
      ".work-open-item-bg",
      {
        width: 0,
        duration: 1.2,
      },
      0.8
    );
    openTl.to(
      ".work-open-item-image",

      {
        scale: 1,
        duration: 1.2,
      },
      0.8
    );
  }, [open, lenis]);

  return (
    <div className="h-svh relative flex items-center justify-center w-fit">
      <div className="fixed top-0 left-0 w-full h-full z-50 px-12 pt-40 flex flex-col pointer-events-none">
        <div
          style={{
            clipPath: "inset(0% 100% 0% 0%)",
          }}
          className="w-full work-open-item relative"
        >
          <div className="absolute w-full h-full bg-[#434343] right-0 top-0 work-open-item-bg z-50"></div>
          <ProjectItem
            projectData={projects[openDataIndex]}
            isProjectPage={true}
          />
        </div>
        <Image
          src={urlForImage(projects[openDataIndex].mainImage)?.url() ?? ""}
          alt=""
          priority
          width={1920}
          height={1080}
          className="w-full h-auto object-contain mt-8 scale-10 origin-bottom work-open-item-image"
        />
      </div>
      <div className="flex items-center gap-[1vw] w-[200vw]">
        {duplicatedProjects.map((project, index) => {
          const dataIndex = index % projects.length;
          return (
            <Slide
              key={index}
              project={project}
              index={index}
              slideRef={slideRefs[index]}
              imageRef={imageRefs[index]}
              dataIndex={dataIndex}
              setActiveIndex={setActiveIndex}
              setOpen={setOpen}
            />
          );
        })}
      </div>
      <MinimapScrollbar projects={projects} activeIndex={activeIndex} />
    </div>
  );
}
