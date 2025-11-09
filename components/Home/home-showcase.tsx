"use client";

import Image from "next/image";
import InfoLine from "../info-line";
import TitleAndDesc from "../title-and-desc";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";

export default function HomeShowcase() {
  useIsomorphicLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".showcase-wrapper",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      defaults: {
        ease: "none",
      },
    });
    tl.to(
      ".showcase-row.row-1",
      {
        x: "-10%",
      },
      0
    );
    tl.to(
      ".showcase-row.row-2",
      {
        x: "10%",
      },
      0
    );
    return () => {
      tl.kill();
    };
  }, []);
  return (
    <section className="w-screen pt-32 pb-40 flex flex-col home-showcase">
      <div className="flex flex-col px-16">
        <InfoLine
          number="01"
          title="Works"
          text={`©${new Date().getFullYear()}`}
        />
        <TitleAndDesc
          playOnScroll
          wrapperClassName="mt-24"
          title="Our Studio"
          desc={
            <>
              We help visionary brands flourish <br />
              by crafting digital experiences that let <br />
              audiences feel the depth, elegance, and <br />
              essence of their products.
            </>
          }
        />
      </div>
      <div className="flex flex-col showcase-wrapper items-center gap-[1.5vw] mt-24 overflow-x-hidden">
        <div className="flex flex-row showcase-row row-1 items-end gap-[1.5vw]">
          <Image
            src="/static/images/showcase/1.png"
            alt="Showcase 1"
            width={1920}
            height={1080}
            className="w-[22.2vw]"
          />
          <Image
            src="/static/images/showcase/2.png"
            alt="Showcase 2"
            width={1920}
            height={1080}
            className="w-[37.2vw]"
          />
          <Image
            src="/static/images/showcase/3.png"
            alt="Showcase 3"
            width={1920}
            height={1080}
            className="w-[25.6vw]"
          />
          <Image
            src="/static/images/showcase/4.png"
            alt="Showcase 4"
            width={1920}
            height={1080}
            className="w-[22.2vw]"
          />
        </div>
        <div className="flex flex-row showcase-row row-2 items-start justify-end gap-[1.5vw]">
          <Image
            src="/static/images/showcase/5.png"
            alt="Showcase 5"
            width={1920}
            height={1080}
            className="w-[22.2vw]"
          />
          <Image
            src="/static/images/showcase/6.png"
            alt="Showcase 6"
            width={1920}
            height={1080}
            className="w-[25.6vw]"
          />
          <Image
            src="/static/images/showcase/7.png"
            alt="Showcase 7"
            width={1920}
            height={1080}
            className="w-[37.2vw]"
          />
          <Image
            src="/static/images/showcase/8.png"
            alt="Showcase 8"
            width={1920}
            height={1080}
            className="w-[22.2vw]"
          />
        </div>
      </div>
    </section>
  );
}
