"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const isAnimating = useRef(false);
  const isExpanding = useRef(false);
  const duplicatedProjects = [...projects, ...projects];

  const totalSlides = duplicatedProjects.length;

  const openDataIndex = useMemo(() => {
    return open !== null ? open % projects.length : 0;
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
      if (isExpanding.current) return;
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

  const handleSetOpen = useCallback((index: number | null) => {
    if (isAnimating.current) return;
    setOpen(index);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (open === null) return;
    if (isAnimating.current) return;
    isAnimating.current = true;

    const slideEl = slideRefs[open]?.current;
    if (!slideEl) {
      isAnimating.current = false;
      return;
    }

    const dataIndex = open % projects.length;
    const slug = projects[dataIndex].slug.current;
    router.prefetch(`/work/${slug}`);

    const rect = slideEl.getBoundingClientRect();
    const currentScroll = lenis?.scroll ?? 0;
    const elementAbsPos = rect.left + currentScroll;
    const targetScroll =
      elementAbsPos - (window.innerWidth / 2 - rect.width / 2);

    lenis?.scrollTo(targetScroll, {
      lock: true,
      duration: 1,
      force: true,
      onComplete: () => {
        lenis?.stop();
        isExpanding.current = true;

        const centeredRect = slideEl.getBoundingClientRect();

        const heroRef = document.querySelector(
          ".work-open-item-image"
        ) as HTMLElement;
        if (!heroRef) return;
        const heroRect = heroRef.getBoundingClientRect();

        const spacer = document.createElement("div");
        spacer.style.width = `${centeredRect.width}px`;
        spacer.style.height = `${centeredRect.height}px`;
        spacer.style.flexShrink = "0";
        slideEl.parentNode?.insertBefore(spacer, slideEl);

        const idealLeft = (window.innerWidth - centeredRect.width) / 2;

        gsap.set(slideEl, {
          position: "fixed",
          left: idealLeft,
          top: centeredRect.top,
          width: centeredRect.width,
          height: centeredRect.height,
          zIndex: 50,
          margin: 0,
          overflow: "hidden",
        });

        const slideImg = slideEl.querySelector("img");
        if (slideImg) gsap.to(slideImg, { x: 0, duration: 0.3 });

        const allSlides = gsap.utils.toArray(".work-slide") as HTMLElement[];

        const tl = gsap.timeline({
          onComplete: () => {
            spacer.remove();
            router.push(`/work/${slug}`);
          },
        });

        allSlides.forEach((slide) => {
          if (slide === slideEl) return;
          const otherRect = slide.getBoundingClientRect();
          const isLeft =
            otherRect.left + otherRect.width / 2 < window.innerWidth / 2;
          const img = slide.querySelector("img");
          // if (img) tl.to(img, { x: 0, duration: 0.3 }, 0);
          tl.to(
            slide,
            {
              x: isLeft
                ? `-=${window.innerWidth / 2}`
                : `+=${window.innerWidth / 2}`,

              duration: 1.4,
            },
            0
          );
        });

        tl.to(
          slideEl,
          {
            left: heroRect.left,
            top: heroRect.top,
            width: heroRect.width,
            height: heroRect.height,
            duration: 1.4,
          },
          0
        );

        const overlayItem = document.querySelector(
          ".work-open-item"
        ) as HTMLElement;
        if (overlayItem) {
          tl.to(
            overlayItem,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1,
            },
            0.5
          );

          tl.fromTo(
            ".work-open-item-bg",
            { xPercent: 0 },
            { xPercent: 101, duration: 1 },
            1
          );
          tl.set(".work-open-bg", { opacity: 1 }, 1);
        }
      },
    });
  }, [open, lenis]);

  return (
    <div className="h-svh relative flex items-center justify-center w-fit">
      <div className="fixed inset-0 z-40 bg-[#f5f5f5] opacity-0 pointer-events-none work-open-bg" />
      <div className="fixed inset-0 z-60 pointer-events-none">
        <div className="w-full h-full px-12 pt-40 flex flex-col">
          <div
            style={{ clipPath: "inset(0% 100% 0% 0%)" }}
            className="w-full work-open-item relative"
          >
            <div
              style={{ backgroundColor: projects[openDataIndex].brandColor }}
              className="absolute w-full h-full right-0 top-0 work-open-item-bg z-50"
            />
            <ProjectItem
              projectData={projects[openDataIndex]}
              isProjectPage={true}
            />
          </div>
          <div className="w-full mt-8 opacity-0 pointer-events-none work-open-item-image">
            <Image
              src={urlForImage(projects[openDataIndex].mainImage)?.url() ?? ""}
              alt=""
              priority
              width={1920}
              height={1080}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
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
              setOpen={handleSetOpen}
            />
          );
        })}
      </div>
      <MinimapScrollbar projects={projects} activeIndex={activeIndex} />
    </div>
  );
}
