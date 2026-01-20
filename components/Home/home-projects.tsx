"use client";

import Image from "next/image";
import Link from "@/components/transition-link";
import SimpleMarquee from "@/components/simple-marquee";
import { gsap } from "@/lib/gsap";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { ProjectsQueryResult } from "@/sanity.types";
import { urlForImage } from "@/lib/sanity/sanity.image";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";

export function ProjectItem({
  projectData,
  isProjectPage,
}: {
  projectData: ProjectsQueryResult[0];
  isProjectPage: boolean;
}) {
  const slug = projectData.slug.current;
  const router = useRouter();
  const lenis = useLenis();

  return (
    <div
      onClick={() => {
        if (isProjectPage) {
          return;
        }

        const activeItem = document.querySelector(
          `.project-item-${slug}`
        ) as HTMLElement;
        router.prefetch(`/work/${slug}`);
        lenis?.stop();
        lenis?.scrollTo(activeItem, {
          offset: -128,
          lock: true,
          duration: 1,
          force: true,
          onComplete: () => {
            router.push(`/work/${slug}`);
          },
        });

        const tl = gsap.timeline();

        const itemParent = activeItem.parentElement;
        const itemImage = activeItem.querySelector(".project-item-image");
        const parentSibling = itemParent?.nextElementSibling;
        const parentPreviousSibling = itemParent?.previousElementSibling;

        tl.to(
          [`.project-item:not(.project-item-${slug})`, ".project-open-hide"],
          {
            opacity: 0,
            duration: 0.05,
          },
          0
        );
        tl.to(
          "main > *:not(.home-projects)",
          {
            opacity: 0,
            duration: 0.3,
            stagger: 0.025,
          },
          0
        );
        tl.to(
          itemImage,
          {
            opacity: 1,
            duration: 1,
          },
          0.3
        );

        tl.to(
          parentSibling ? parentSibling : parentPreviousSibling || "",
          {
            width: 0,
            padding: 0,
            duration: 1,
          },
          0.2
        );
        tl.to(
          itemParent,
          {
            padding: 0,
            duration: 1,
          },
          0.1
        );
        tl.to(
          itemParent,
          {
            width: "100%",
            duration: 1,
          },
          0.1
        );
      }}
      className={cn(
        "w-full min-w-[45vw] cursor-pointer group tracking-tighter relative z-10 project-item",
        `project-item-${slug}`
      )}
    >
      <span className="text-white text-6xl leading-[0.75] absolute left-0">
        {projectData.title}
      </span>
      <div className="w-full border-y-[1px] border-[#303030]/30 flex flex-row items-center relative overflow-hidden">
        <span className="w-[52%] text-white text-6xl leading-[0.75] opacity-0 pointer-events-none">
          {projectData.title}
        </span>
        {/* <div
          style={{
            mask: "linear-gradient(to right, transparent 0%, black 15%, black 100%)",
          }}
          className="absolute w-[48%] h-full z-10 overflow-hidden right-0 translate-y-[100%] group-hover:-translate-y-0 transition-transform duration-300 ease-out"
        >
          <SimpleMarquee
            baseVelocity={70}
            repeat={20}
            style={{ backgroundColor: projectData.brandColor }}
            direction="left"
            className={cn("h-full")}
          >
            <div className="h-full w-auto aspect-square flex items-center justify-center pr-3 box-content">
              <Image
                src={urlForImage(projectData.logoMarquee)?.url() ?? ""}
                alt={projectData.title}
                width={500}
                height={500}
                className="w-2/3 h-auto max-h-2/3 object-contain"
              />
            </div>
          </SimpleMarquee>
        </div> */}
        <div className="w-[48%] relative grid grid-cols-4 whitespace-nowrap items-center gap-4 text-white text-sm overflow-hidden transition-transform duration-300 ease-out">
          <div className="flex-col col-span-2">
            <span className="text-[#5E5E5E]">
              ({projectData.projectOrigin.type}){" "}
            </span>
            <span className="text-white">
              {projectData.projectOrigin.subbrand}
            </span>
          </div>
          <span className="">{projectData.category.title}</span>
          <div className="flex flex-row items-center gap-6 justify-center relative">
            <Image
              src={urlForImage(projectData.logo)?.url() ?? ""}
              alt={projectData.title}
              width={500}
              height={500}
              className="w-auto h-11"
            />
            <Link
              href={`/work/${slug}`}
              className="flex flex-row items-center gap-2 justify-self-end absolute right-0"
            >
              <span className="block w-3 text-[#5E5E5E]">
                <svg
                  width="100%"
                  viewBox="0 0 10 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.37205 0.379864L9.37025 7.14139L8.7499 7.14156L8.75066 4.2903L8.75142 1.43904L1.60255 8.5879L1.16401 8.14936L8.31288 1.0005L2.61036 1.00202L2.61052 0.381663L9.37205 0.379864Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeLinecap="square"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-20 w-screen max-w-none px-12 project-item-image opacity-0 pointer-events-none">
        <Image
          src={urlForImage(projectData.mainImage)?.url() ?? ""}
          alt={projectData.title}
          width={1920}
          height={1080}
          className="w-full object-cover"
        />
      </div>
    </div>
  );
}

export default function HomeProjects({
  projects,
}: {
  projects: ProjectsQueryResult;
}) {
  const firstHalfOfProjects = projects.slice(0, 3);
  const secondHalfOfProjects = projects.slice(3);

  return (
    <>
      <div className="mt-44 w-screen relative z-[10]">
        <SimpleMarquee
          direction="left"
          repeat={6}
          className="py-0 text-white markos border-y-[1px] border-[#303030]/30 h-[4.6rem] items-center"
        >
          <div className="relative font-ballet text-9xl mt-5 pr-2">
            Works{" "}
            <span className="text-[#5E5E5E] font-helvetica-now text-lg absolute -top-2 -right-8">
              (01)
            </span>
          </div>
          <div className="text-8xl px-10 flex items-center gap-6 tracking-tight">
            <span className="w-12 h-[6px] bg-white"></span>
            By Pensatori Irrazionali
            <span className="w-12 h-[6px] bg-white"></span>
          </div>
        </SimpleMarquee>
      </div>
      <div className="w-screen px-12 pt-32 pb-40 flex flex-col home-projects">
        {/* <h2 className="text-white flex items-center gap-4 tracking-tight project-open-hide">
          <span>Work</span>
          <span className="w-11 h-[1px] bg-white"></span>
          <span>Year Database © 2012-{new Date().getFullYear()}</span>
        </h2> */}

        <div className={cn("w-full flex flex-row gap-0 mt-8")}>
          <div className="w-1/2 flex flex-col gap-8 pr-4">
            {firstHalfOfProjects.map((projectData: ProjectsQueryResult[0]) => {
              return (
                <ProjectItem
                  key={projectData.slug.current}
                  projectData={projectData}
                  isProjectPage={false}
                />
              );
            })}
          </div>
          <div className="w-1/2 flex flex-col gap-8 pl-4">
            {secondHalfOfProjects.map((projectData: ProjectsQueryResult[0]) => {
              return (
                <ProjectItem
                  key={projectData.slug.current}
                  projectData={projectData}
                  isProjectPage={false}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
