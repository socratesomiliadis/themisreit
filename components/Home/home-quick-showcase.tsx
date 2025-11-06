"use client";

import Image from "next/image";
import InfoLine from "../info-line";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, SplitText } from "@/lib/gsap";

export default function HomeQuickShowcase() {
  useIsomorphicLayoutEffect(() => {
    let tl: GSAPTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".home-quick-showcase-wrapper",
        start: "top 75%",
        end: "center 45%",
        scrub: 2,
      },
    });
    const split = SplitText.create(".home-quick-showcase-text", {
      type: "words",
      wordsClass: "home-quick-showcase-word",
      autoSplit: true,
      ignore: ".split-ignore",
      onSplit: (self) => {
        self.words.forEach((word) => {
          gsap.set(word, {
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)",
          });
        });
        gsap.set(".home-quick-showcase-anim", {
          opacity: 0,
          scale: 0.9,
          filter: "blur(10px)",
        });
        tl.to(
          [self.words, ".home-quick-showcase-anim"],
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            stagger: 0.1,
            duration: 3,
            ease: "none",
          },
          0
        );
      },
    });
    return () => {
      tl?.kill();
    };
  }, []);
  return (
    <section className="w-screen px-16 pt-32 pb-40 flex flex-col home-quick-showcase">
      <InfoLine
        number="01"
        title="Works"
        text={`©${new Date().getFullYear()}`}
      />
      <div className="w-full flex flex-col text-white leading-none mt-32 home-quick-showcase-wrapper">
        <div className="line-1 w-full flex flex-row gap-3 justify-center items-center">
          <span className="text-[14rem] tracking-tighter font-medium home-quick-showcase-text">
            THE ID<span className="tracking-normal split-ignore">E</span>A
          </span>
          <div className="flex flex-col gap-7">
            <span className="text-6xl tracking-tighter italic -ml-[10%] home-quick-showcase-text">
              IS NOT
            </span>
            <span className="font-ballet text-[5.4rem] home-quick-showcase-text">
              To live forever
            </span>
          </div>
        </div>
        <div className="line-2 -mt-10 w-full flex flex-row gap-3 justify-start items-end">
          <span className="text-5xl font-pp-editorial mb-6 block -mr-10 home-quick-showcase-text">
            it is
          </span>
          <span className="text-[14rem] tracking-tighter font-medium home-quick-showcase-text">
            TO CR<span className="tracking-normal split-ignore">E</span>ATE
          </span>
        </div>
        <div className="line-3 -mt-10 w-full flex flex-row gap-3 justify-end items-end">
          <span className="text-[14rem] tracking-tighter font-medium home-quick-showcase-text">
            SOM<span className="tracking-normal split-ignore">E</span>THING
          </span>
          <div className="flex flex-col relative">
            <Image
              src="/static/images/andySignature.png"
              alt="Andy Signature"
              width={215 * 2}
              height={77 * 2}
              className="w-52 absolute top-[-150%] left-[-15%] home-quick-showcase-anim"
            />
            <span className="font-bold text-[4rem] mb-5 home-quick-showcase-text">
              THAT WILL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
