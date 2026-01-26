"use client";

import Image from "next/image";
import TitleAndDesc from "../title-and-desc";

export default function HomeHero() {
  return (
    <section className="relative w-screen h-[110vh] flex items-end px-12 pb-[8%] home-hero overflow-hidden">
      <TitleAndDesc
        delay={1.2}
        wrapperClassName="z-20"
        title="Atelier"
        desc={
          <>
            A creative house based in Europe, operating <br />
            worldwide. We shape experiences where depth, <br />
            elegance, and essence are felt—not explained.
          </>
        }
      />
      <Image
        src="/static/images/flagsTrans.png"
        alt="BGImage"
        width={1920}
        quality={100}
        height={1080}
        priority
        className="absolute top-[-35%] right-[-20%] rotate-[-15deg] w-auto h-[150%] object-contain z-10"
      />
    </section>
  );
}
