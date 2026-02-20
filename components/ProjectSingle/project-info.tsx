"use client";

import { ProjectBySlugQueryResult, ServicesQueryResult } from "@/sanity.types";
import { cn, getContrastTextColor } from "@/lib/utils";
import SimpleMarquee from "@/components/simple-marquee";
import Cross from "@/components/SVGs/cross";
import { urlForImage } from "@/lib/sanity/sanity.image";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/gsap";

export default function ProjectInfo({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData || !projectData.projectInfo) return null;
  const { numOfPeople, numOfHours, location, director } =
    projectData.projectInfo;
  const { title, brandColor, year } = projectData;

  const infoItems = [
    {
      title: "About",
      value: `${title} by Pensatori Irrazionali`,
    },
    {
      title: "Work Hours",
      value: `${numOfHours} hours`,
    },
    {
      title: "Work Location",
      value: location,
    },
    {
      title: "Director of Project",
      value: director,
    },
    {
      title: "Published by",
      value: "Pensatori Irrazionali",
    },
  ];
  return (
    <div className="w-full flex flex-col pt-12">
      <div className="w-full px-12 pb-32 grid grid-cols-2 text-[#434343] tracking-tight">
        <span>People Worked</span>
        <span>Project Details</span>
        <div className="w-full col-span-2 h-px bg-black/20 mt-2 mb-24"></div>
        <span className="font-ballet text-[28rem] ml-12 leading-[0.6]">
          {projectData.projectInfo.numOfPeople}
        </span>
        <div className="flex flex-col gap-6 pb-24">
          <div className="flex flex-row items-center gap-2">
            <Cross className="size-2.5" />
            <span>(Information)</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span
              style={{ backgroundColor: brandColor }}
              className="size-5 rounded-full"
            ></span>
            <span className="text-3xl">Information about '{title}'</span>
          </div>
          <div className="flex flex-col w-full">
            {infoItems.map((info, infoIndex) => (
              <div
                key={infoIndex}
                className={cn(
                  "w-full flex flex-row items-center justify-between gap-2 border-b border-black/20 py-1",
                  infoIndex === 0 && "border-t"
                )}
              >
                <span>{info.title}</span>
                <span className="text-[#5E5E5E]">{info.value}</span>
              </div>
            ))}
          </div>
          <button className="flex flex-row items-center gap-2 bg-white text-[#434343] px-8 py-2 w-fit">
            <span className="uppercase text-xs tracking-tight">Learn More</span>
            <span className="block w-2">
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
          </button>
        </div>
      </div>
      <SimpleMarquee
        baseVelocity={10}
        repeat={20}
        style={{ backgroundColor: brandColor }}
        direction="left"
        className={cn("w-full py-2")}
      >
        <span
          className="uppercase text-sm pr-1"
          style={{ color: getContrastTextColor(brandColor) }}
        >
          LEARN MORE ABOUT {title} — LET&apos;S WORK —
        </span>
      </SimpleMarquee>
    </div>
  );
}
