"use client";

import Image from "next/image";
import TitleAndDesc from "../title-and-desc";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";
export default function HomeHero() {
  useIsomorphicLayoutEffect(() => {
    const tl = gsap.timeline({
      delay: 1.2,
      defaults: {
        duration: 1,
        ease: "power2.out",
      },
    });
    tl.to(
      ".home-hero-anim",
      {
        opacity: 1,
        filter: "blur(0px)",
      },
      0
    );
    tl.to(
      ".home-hero-anim-noblur",
      {
        opacity: 1,
      },
      0
    );
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="relative w-screen h-[110vh] flex items-end px-16 pb-[8%] home-hero">
      <TitleAndDesc
        delay={1}
        wrapperClassName="z-20"
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

      <Image
        src="/static/images/flags.png"
        alt="BGImage"
        width={1920}
        quality={100}
        height={1080}
        priority
        className="absolute top-0 right-[-20%] rotate-[-15deg] w-auto h-full object-contain z-10"
      />

      {/* <div className="size-72 rounded-full bg-[#0E1012] shadow-[0_4px_223px_435px_#0E1012] absolute top-[10%] right-[15%] z-[5]"></div> */}
    </section>
  );
}
