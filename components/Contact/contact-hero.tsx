"use client";

import Image from "next/image";
import { BakedRelief } from "../WebGL";
import { cn } from "@/lib/utils";

const CONTACT_FORM_BUTTONS = [
  { value: "$50,000" },
  { value: "$100,000" },
  { value: "$150,000" },
  { value: "$200,000" },
  { value: "$250,000" },
];

const WEBGL_TEXTURES = {
  bake1: "/textures/hand/6.png",
  bake2: "/textures/hand/5.png",
  bake3: "/textures/hand/4.png",
  bake4: "/textures/hand/3.png",
  bake5: "/textures/hand/2.png",
  bake6: "/textures/hand/1.png",
};

function ContactFormButton({ value }: { value: string }) {
  return (
    <button className="flex flex-row items-center gap-2 bg-[#434343] text-white px-8 py-2 w-fit">
      <span className="font-some-type-mono text-sm">{value}</span>
      <span className="w-3">
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
            fill="white"
          />
        </svg>
      </span>
    </button>
  );
}

export default function ContactHero() {
  return (
    <section className="w-screen h-svh contact-hero relative flex items-center justify-center z-10">
      <div className="absolute h-full flex items-center justify-center z-10">
        <svg
          height="100%"
          viewBox="0 0 1006 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="501"
            cy="501"
            r="501.312"
            transform="matrix(-1 0 0 1 1004 39)"
            stroke="#B9B9B9"
            strokeDasharray="8 8"
          />
          <line
            x1="0.5"
            y1="1080"
            x2="0.500047"
            y2="-2.18556e-08"
            stroke="#B9B9B9"
          />
          <line
            x1="1005.5"
            y1="1080"
            x2="1005.5"
            y2="-2.18556e-08"
            stroke="#B9B9B9"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <p className="text-4xl text-[#4334343] text-center tracking-tighter">
            Alright, let&apos;s not be strangers. What should <br />I call the
            genius behind this project?
          </p>
          <div className="flex flex-row flex-wrap w-2/3 justify-center mt-6 gap-4">
            {CONTACT_FORM_BUTTONS.map((button) => (
              <ContactFormButton key={button.value} value={button.value} />
            ))}
          </div>
        </div>
      </div>
      {/* <Image
        src="/static/images/contactBg.png"
        alt="Contact Hero"
        width={1920 * 1.5}
        height={1080 * 1.5}
        className="w-full h-full absolute top-0 left-0 z-0 object-cover"
      /> */}
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-screen z-5 flex flex-col items-center justify-center pointer-events-none max-h-full overflow-hidden"
        )}
      >
        <BakedRelief
          className="w-screen aspect-square h-auto"
          textures={WEBGL_TEXTURES}
        />
      </div>
    </section>
  );
}
