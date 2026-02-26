"use client";

import { ClientsQueryResult } from "@/sanity.types";
import { cn } from "@/lib/utils";
import SimpleMarquee from "@/components/simple-marquee";
import Cross from "@/components/SVGs/cross";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/gsap";

import "swiper/css";

export default function ServiceItem({
  client,
  index,
}: {
  client: ClientsQueryResult[0];
  index: number;
}) {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full grid grid-cols-2 px-12 text-[#434343] tracking-tight">
        <span>Brand</span>
        <span>Information</span>
        <div className="w-full col-span-2 h-px bg-black/20 mt-2 mb-16"></div>
        <Image
          src={urlForImage(client.logo)?.url() ?? ""}
          alt={client.name}
          width={600}
          height={600}
          className="h-12 w-auto object-contain"
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center gap-2">
            <Cross className="size-2.5" />
            <span>({client.name})</span>
          </div>

          <span className="text-3xl">{client.title}</span>
          <p>{client.description}</p>
          <Image
            src={urlForImage(client.mainImage)?.url() ?? ""}
            alt={client.name}
            width={1920}
            height={1080}
            className="w-full object-cover"
          />
        </div>
      </div>
      <SimpleMarquee
        baseVelocity={10}
        repeat={20}
        direction="left"
        className={cn(
          "w-full py-2 bg-black text-white font-some-type-mono mt-8"
        )}
      >
        <span className="uppercase text-sm pr-1">
          {client.name} — BY PENSATORI IRRAZIONALI —
        </span>
      </SimpleMarquee>
    </div>
  );
}
