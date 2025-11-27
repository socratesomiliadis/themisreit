"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

const LEFT_LIST = [
  "Websites",
  "Metaverse",
  "Content",
  "Games",
  "Brands",
  "Animations",
  "3D Models",
  "AR & VR",
];

const RIGHT_LIST = [
  "Since 2019",
  "Since 2017",
  "Since 2022",
  "Since 2012",
  "Since 2018",
  "Since 2013",
  "Since 2018",
  "Since 2017",
];

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  // Radius for the circle
  const baseRadius = 246; // Approx from Figma (452 / 2)

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#111111] overflow-hidden">
      {/* Center Content */}
      <div className="relative z-10 flex items-center gap-12">
        {/* Left List */}
        <div className="flex flex-col gap-2 text-[10px] text-white/80 font-helvetica-now text-left">
          {LEFT_LIST.map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </div>

        {/* Circle & Progress */}
        <div className="relative w-[48vw] aspect-square flex items-center justify-center">
          {/* Static outer ring (optional based on design interpretation) */}

          {/* Progress Circle */}

          <svg
            width="100%"
            className="absolute inset-0"
            viewBox={`0 0 980 980`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <circle
                key={i}
                stroke="white"
                strokeWidth="0.6"
                cx={baseRadius * 2}
                cy={baseRadius * 2}
                r={baseRadius + i * 75}
              />
            ))}
            {Array.from({ length: 34 }).map((_, i) => (
              <circle
                key={i}
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="0.6"
                cx={baseRadius * 2}
                cy={baseRadius * 2}
                r={baseRadius + 52 + i * 5}
              />
            ))}
          </svg>

          {/* Inner Text */}
          <div className="flex flex-col items-center text-white relative">
            <span className="font-ballet text-[56px] leading-tight">
              Loading
            </span>
            <span className="font-helvetica-now text-[12px] mt-2 absolute top-0 right-0">
              (0%)
            </span>
          </div>
        </div>

        {/* Right List */}
        <div className="flex flex-col gap-2 text-[10px] text-white/80 font-helvetica-now text-right">
          {RIGHT_LIST.map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
