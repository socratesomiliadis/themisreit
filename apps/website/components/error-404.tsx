"use client";

import Image from "next/image";
import Frame from "./SVGs/frame";
import Link from "./transition-link";

export default function Error404() {
  return (
    <div className="w-screen h-svh relative flex flex-col items-center justify-center z-10">
      <div className="flex flex-col z-10 text-[#434343] -mb-[7%]">
        <h1 className="text-[20vw] font-ballet tracking-tight z-10 text-[#434343] leading-[0.9] pointer-events-none">
          Error 404
        </h1>
        <span className="text-base tracking-tight mt-8">
          Pensatori Irrazionali
        </span>
        <p className="text-3xl tracking-tight">
          Whoops! It seems like you've taken <br />a detour into the digital
          wilderness.
        </p>
        <Link
          href="/"
          className="flex flex-row items-center gap-2 bg-[#434343] text-white px-8 py-2 w-fit mt-4"
        >
          <span className="uppercase text-xs tracking-tight font-some-type-mono">
            Home
          </span>
          <span className="block w-2">
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
                fill="currentColor"
              />
            </svg>
          </span>
        </Link>
      </div>
      <div className="absolute flex items-center justify-center inset-0 p-5 z-20 text-[#d9d9d9] pointer-events-none">
        <Frame />
      </div>
      <Image
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black)",
          maskSize: "100% 100%",
        }}
        src="/static/images/tempFooter.png"
        width={2560}
        height={1440}
        className="w-full z-0 absolute bottom-0"
        alt="Footer"
      />
    </div>
  );
}
