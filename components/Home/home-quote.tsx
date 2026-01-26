"use client";

import Image from "next/image";
import InfoLine from "../info-line";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, SplitText } from "@/lib/gsap";

export default function HomeQuote() {
  useIsomorphicLayoutEffect(() => {
    let tl: GSAPTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".home-quote-wrapper",
        start: "top 75%",
        end: "center center",
        scrub: 2,
      },
    });
    const split = SplitText.create(".home-quote-text", {
      type: "words",
      wordsClass: "home-quote-word",
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
        gsap.set(".home-quote-anim", {
          opacity: 0,
          scale: 0.9,
          filter: "blur(10px)",
        });
        tl.to(
          [self.words, ".home-quote-anim"],
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
      split.revert();
      tl?.kill();
    };
  }, []);
  return (
    <section className="w-screen px-12 py-24 flex flex-col home-quote relative z-10">
      {/* <InfoLine title="Works" text={`©${new Date().getFullYear()}`} /> */}
      <div className="w-full flex flex-col text-[#434343] leading-none mt-32 home-quote-wrapper">
        <div className="line-1 w-full flex flex-row gap-3 justify-center items-end">
          <span className="text-[13.5rem] tracking-tighter font-medium home-quote-text">
            THE ID<span className="tracking-normal split-ignore">E</span>A
          </span>
          <div className="flex flex-row items-end gap-7 mb-[1.2%] ml-1">
            <span className="text-6xl tracking-tighter leading-none italic font-pp-editorial home-quote-text">
              IS NOT
            </span>
            <span className="font-ballet text-5xl leading-none home-quote-text lowercase -ml-[5%] -mb-[2.5%]">
              to live forever
            </span>
          </div>
        </div>
        <div className="line-2 -mt-10 w-full flex flex-row gap-3 justify-start items-end">
          <span className="text-5xl font-pp-editorial mb-6 block -mr-10 home-quote-text">
            it is
          </span>
          <span className="text-[13.5rem] tracking-tighter font-medium home-quote-text">
            TO CR<span className="tracking-normal split-ignore">E</span>ATE
          </span>
        </div>
        <div className="line-3 -mt-10 w-full flex flex-row gap-3 justify-end items-end">
          <span className="text-[13.5rem] tracking-tighter font-medium home-quote-text">
            SOM<span className="tracking-normal split-ignore">E</span>THING
          </span>
          <div className="flex flex-col relative">
            <Image
              src="/static/images/andySignature.png"
              alt="Andy Signature"
              width={215 * 2}
              height={77 * 2}
              className="w-52 absolute top-[-150%] left-[-15%] home-quote-anim invert"
            />
            <span className="font-bold text-[3.5rem] tracking-tighter mb-5 home-quote-text lowercase">
              THAT WILL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
