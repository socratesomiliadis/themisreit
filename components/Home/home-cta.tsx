"use client";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";
import ScrambleIn, { ScrambleInHandle } from "../scramble-in";
import { useRef } from "react";
import Link from "@/components/transition-link";

export default function HomeCta() {
  const ref = useRef<ScrambleInHandle>(null);
  useIsomorphicLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".home-cta",
        start: "top center",
        end: "center 45%",
        scrub: 1,
      },
    });
    tl.to(".cta-item", {
      scale: (index: number) => 1 - index / 13,
      ease: "none",
    });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".last-text-wrapper",
        start: "center center",
        end: "+=50%",
        scrub: 1,
      },
    });
    tl2.to(".testos", {
      y: "200%",
      x: "-6%",
      height: "17rem",
      width: "4rem",
      backgroundColor: "#F259EF",
      rotate: 90,
      ease: "none",
    });
    tl2.addLabel("start");
    tl2.set(
      ".testos",
      {
        pointerEvents: "auto",
      },
      "start-=0.2"
    );
    tl2.to(
      ".testos-text",
      {
        scrambleText: {
          text: "CONTACT US",
        },
        opacity: 1,
        ease: "none",
      },
      "start-=0.3"
    );
    return () => {
      tl.kill();
      tl2.kill();
    };
  }, []);

  return (
    <section className="w-screen px-12 -mt-64 pb-40 flex flex-col items-center home-cta relative z-10">
      <div className="relative w-full cta-wrapper">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={
              {
                //   scale: 1 - index / 12,
              }
            }
            className="text-[#434343] origin-bottom absolute w-[103%] -left-[2.2vw] cta-item"
          >
            <span className="text-fit z-1 relative">
              <span>
                {index === 5 ? (
                  <span className="text-fit">
                    <span>
                      <span className="last-text-wrapper">
                        BU
                        <span className="last-text-i relative">
                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[48%] w-[45%] h-[48%] flex items-center justify-center">
                            <Link
                              href="/contact"
                              className="w-full h-full bg-[#434343] testos text-2xl text-[#434343] flex items-center justify-center z-20 pointer-events-none"
                            >
                              <span className="-rotate-90 block whitespace-nowrap testos-text pointer-events-none"></span>
                            </Link>
                          </div>

                          <span className="opacity-0 pointer-events-none">
                            I
                          </span>
                        </span>
                        LD
                      </span>
                    </span>
                    <span aria-hidden="true">BUILD</span>
                  </span>
                ) : (
                  <span className="text-fit">
                    <span>
                      <span>BUILD</span>
                    </span>
                    <span aria-hidden="true">BUILD</span>
                  </span>
                )}
              </span>
              <span aria-hidden="true">BUILD</span>
            </span>
            <div className="h-[30vw] bg-[#f5f5f5] absolute w-full left-0 top-1/2 -translate-y-[48%] z-0"></div>
          </div>
        ))}
        <span
          aria-hidden="true"
          className="text-fit opacity-0 pointer-events-none"
        >
          <span>
            <span className="text-fit">
              <span>
                <span>BUILD</span>
              </span>
              <span aria-hidden="true">BUILD</span>
            </span>
          </span>
          <span aria-hidden="true">BUILD</span>
        </span>
      </div>
    </section>
  );
}
