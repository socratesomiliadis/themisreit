"use client";

import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { useState } from "react";
import { useLenis } from "lenis/react";

const LEFT_LIST = [
  "Websites",
  "Metaverse",
  "Content",
  "Brands",
  "Animations",
  "3D Models",
  "AR & VR",
];

const RIGHT_LIST = [
  "Since 2019",
  "Since 2017",
  "Since 2022",
  "Since 2018",
  "Since 2013",
  "Since 2018",
  "Since 2017",
];

function renderCurvedList(items: string[], side: "left" | "right") {
  const mid = Math.floor(items.length / 2);
  return items.map((item, index) => {
    return (
      <div
        style={{
          transform:
            mid === index
              ? "translateX(0%)"
              : index < mid
              ? `translateX(${
                  side === "left" ? (mid - index) * 8 : -((mid - index) * 8)
                }%)`
              : `translateX(${
                  side === "left" ? -(mid - index) * 8 : (mid - index) * 8
                }%)`,
        }}
        className={`loader-list-item-${side}`}
        key={index}
      >
        {item}
      </div>
    );
  });
}

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  useIsomorphicLayoutEffect(() => {
    const loaderTl = gsap.timeline({
      onUpdate: () => {
        setProgress(Math.round(loaderTl.progress() * 100));
      },
      onComplete: () => {
        gsap.to(".loader-wrapper", {
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: "power2.out",
        });
        gsap.set(".loader-wrapper", {
          pointerEvents: "none",
        });
        lenis?.start();
      },
    });
    const rotateTween = gsap.to(".loader-rotate", {
      rotate: -360,
      duration: 40,
      repeat: -1,
      ease: "linear",
    });
    loaderTl.to(".loader-circle", {
      scale: 1,
      duration: 1,
      stagger: 0.05,
    });
    loaderTl.to(
      ".loader-circle-secondary",
      {
        opacity: 1,
        duration: 0.6,
        stagger: 0.02,
      },
      0.4
    );
    loaderTl.from(
      ".loader-list-item-left",
      {
        x: "-150%",
        duration: 0.8,
        stagger: 0.05,
      },
      0.3
    );
    loaderTl.from(
      ".loader-list-item-right",
      {
        x: "150%",
        duration: 0.8,
        stagger: 0.05,
      },
      0.3
    );
    loaderTl.to(".loader-wrapper", {
      duration: 0.8,
    });

    return () => {
      loaderTl.kill();
      rotateTween.kill();
    };
  }, [lenis]);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#111111] overflow-hidden loader-wrapper">
      <div className="relative z-10 flex items-center gap-12">
        <div className="relative max-w-full h-[calc(100vh-0rem)] aspect-square flex items-center justify-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: `${50 + i * 14}%`,
              }}
              className={cn(
                "absolute h-[55%] aspect-square rounded-full border border-white/60 scale-0 loader-circle",
                i === 0 && "bg-[#111111] z-10",
                i === 3 &&
                  "flex items-center justify-center overflow-hidden z-5"
              )}
            >
              {i === 0 && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                  <div className="flex flex-col items-center text-white relative z-10">
                    <span className="font-ballet text-[2.5vw] leading-tight">
                      Loading
                    </span>
                    <span className="font-helvetica-now text-[0.6vw] mb-2 absolute top-0 left-[84%] tabular-nums">
                      ({progress}%)
                    </span>
                  </div>
                  <div className="absolute left-4 flex flex-col gap-2 text-xs text-white font-helvetica-now text-left">
                    {renderCurvedList(LEFT_LIST, "left")}
                  </div>
                  <div className="absolute right-4 flex flex-col gap-2 text-xs text-white font-helvetica-now text-right">
                    {renderCurvedList(RIGHT_LIST, "right")}
                  </div>
                </div>
              )}
              {i === 3 && (
                <div className="relative w-full h-full loader-rotate">
                  <Image
                    src="/static/images/loaderImage2.png"
                    alt="Logo"
                    width={800}
                    height={800}
                    priority
                    className="w-1/2 aspect-square top-0 left-0 absolute"
                  />
                  <Image
                    src="/static/images/loaderImage1.png"
                    alt="Logo"
                    width={800}
                    height={800}
                    priority
                    className="w-1/2 aspect-square bottom-0 right-0 absolute"
                  />
                  {/* <div className="absolute w-[31%] right-0 flex items-center justify-center">
                    <svg
                      width="100%"
                      viewBox="0 0 213 214"
                      fill="none"
                      className="opacity-60"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="0.513634"
                        y1="213.146"
                        x2="171.514"
                        y2="42.1464"
                        stroke="white"
                      />
                      <line
                        x1="0.483077"
                        y1="213.18"
                        x2="155.483"
                        y2="27.1799"
                        stroke="white"
                      />
                      <line
                        x1="0.456609"
                        y1="213.215"
                        x2="139.457"
                        y2="13.2146"
                        stroke="white"
                      />
                      <line
                        x1="0.434196"
                        y1="213.25"
                        x2="123.434"
                        y2="0.249963"
                        stroke="white"
                      />
                      <line
                        x1="1.01435"
                        y1="212.068"
                        x2="212.616"
                        y2="89.0677"
                        stroke="white"
                      />
                      <line
                        x1="0.978923"
                        y1="212.09"
                        x2="199.58"
                        y2="73.0904"
                        stroke="white"
                      />
                      <line
                        x1="0.944108"
                        y1="212.117"
                        x2="185.546"
                        y2="57.1171"
                        stroke="white"
                      />
                    </svg>
                  </div>
                  <div className="absolute w-[31%] left-0 bottom-0 flex items-center justify-center">
                    <svg
                      width="100%"
                      viewBox="0 0 213 214"
                      fill="none"
                      className="opacity-60 rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="0.513634"
                        y1="213.146"
                        x2="171.514"
                        y2="42.1464"
                        stroke="white"
                      />
                      <line
                        x1="0.483077"
                        y1="213.18"
                        x2="155.483"
                        y2="27.1799"
                        stroke="white"
                      />
                      <line
                        x1="0.456609"
                        y1="213.215"
                        x2="139.457"
                        y2="13.2146"
                        stroke="white"
                      />
                      <line
                        x1="0.434196"
                        y1="213.25"
                        x2="123.434"
                        y2="0.249963"
                        stroke="white"
                      />
                      <line
                        x1="1.01435"
                        y1="212.068"
                        x2="212.616"
                        y2="89.0677"
                        stroke="white"
                      />
                      <line
                        x1="0.978923"
                        y1="212.09"
                        x2="199.58"
                        y2="73.0904"
                        stroke="white"
                      />
                      <line
                        x1="0.944108"
                        y1="212.117"
                        x2="185.546"
                        y2="57.1171"
                        stroke="white"
                      />
                    </svg>
                  </div> */}
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: 34 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: `${59 + i * 1}%`,
              }}
              className={cn(
                "absolute h-[55%] aspect-square rounded-full border border-white/10 pointer-events-none z-0 opacity-0 loader-circle-secondary"
              )}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
