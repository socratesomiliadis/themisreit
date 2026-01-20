"use client";

import { ServicesQueryResult } from "@/sanity.types";
import { cn } from "@/lib/utils";
import SimpleMarquee from "@/components/simple-marquee";
import Cross from "@/components/SVGs/cross";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/gsap";

import "swiper/css";

export default function ServiceItem({
  service,
  index,
}: {
  service: ServicesQueryResult[0];
  index: number;
}) {
  return (
    <div className="w-full flex flex-col pt-12">
      <div className="w-full px-12 grid grid-cols-2 text-white tracking-tight">
        <span>Number</span>
        <span>Service</span>
        <div className="w-full col-span-2 h-px bg-white/20 mt-2 mb-24"></div>
        <span className="font-ballet text-[28rem] ml-12 leading-[0.6]">
          {index + 1}
        </span>
        <div className="flex flex-col gap-6 pb-24">
          <div className="flex flex-row items-center gap-2">
            <Cross className="size-2.5" />
            <span>({service.smallTitle})</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span
              style={{ backgroundColor: service.color }}
              className="size-5 rounded-full"
            ></span>
            <span className="text-3xl">{service.title}</span>
          </div>
          <div className="flex flex-col w-full">
            {service.features.map((feature, feaIndex) => (
              <div
                key={feaIndex}
                className={cn(
                  "w-full flex flex-row items-center justify-between gap-2 border-b border-white/20 py-1",
                  feaIndex === 0 && "border-t"
                )}
              >
                <span>{feature.title}</span>
                <span className="text-[#5E5E5E]">{feature.description}</span>
              </div>
            ))}
          </div>
          <button className="flex flex-row items-center gap-2 bg-white text-black px-8 py-2 w-fit">
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
        style={{ backgroundColor: service.color }}
        direction="left"
        className={cn("w-full py-2")}
      >
        <span className="uppercase text-sm pr-1">
          LEARN MORE ABOUT {service.smallTitle} — LET&apos;S WORK —
        </span>
      </SimpleMarquee>
      <div className="w-full py-24 flex flex-col bg-[#171717] text-white">
        <div className="flex flex-row items-center gap-2 ml-12">
          <Cross className="size-2.5" />
          <span>(About it)</span>
        </div>
        <p className="text-3xl tracking-tight w-1/3 text-pretty mt-4 ml-12">
          {service.description}
        </p>
        <div className="flex flex-col mt-36">
          <div className="flex flex-row items-center gap-2 ml-12">
            <Cross className="size-2.5" />
            <span>Examples & Work</span>
          </div>
          <Swiper
            className="w-full mt-4"
            grabCursor
            slidesPerView={2.2}
            spaceBetween={10}
            slidesOffsetBefore={48}
            slidesOffsetAfter={48}
          >
            {service.examples.map((example, exIndex) => (
              <SwiperSlide key={exIndex}>
                <Image
                  onLoad={() => {
                    if (index === 0) ScrollTrigger.refresh();
                  }}
                  src={urlForImage(example)?.url() ?? ""}
                  alt={service.title}
                  width={1920}
                  height={1080}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
