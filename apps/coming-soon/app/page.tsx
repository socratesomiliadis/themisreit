import Image from "next/image";
import Frame from "@/components/SVGs/frame";
import Pensatori from "@/components/SVGs/pensatori-logo";

export default function Home() {
  return (
    <div className="w-screen h-svh relative flex flex-col items-center justify-center z-10">
      <div className="fixed left-12 top-10 w-18 z-997 text-[#434343] flex flex-col gap-1">
        <Pensatori />
        <svg
          width="100%"
          viewBox="0 0 292 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M97.2033 0H0V19.7034H97.2033V0Z" fill="#009246" />
          <path d="M194.399 0H97.1953V19.7034H194.399V0Z" fill="white" />
          <path d="M291.617 0H194.414V19.7034H291.617V0Z" fill="#CE2B37" />
        </svg>
      </div>
      <span className="block fixed w-18 top-24 left-12 z-997 mt-1"></span>
      <div className="flex flex-col z-10 text-[#434343] -mb-[7%] pl-12">
        <h1 className="text-[26vw] lg:text-[17vw] font-ballet tracking-tight z-10 text-[#434343] leading-[0.6] pointer-events-none">
          Coming{" "}
          <span className="block lg:hidden">
            <br />
          </span>
          Soon
        </h1>
        <span className="text-sm lg;text-base tracking-tight mt-16 lg:mt-8">
          Pensatori Irrazionali
        </span>
        <p className="text-xl lg:text-3xl tracking-tight">
          There&apos;s a higher chance of winning the <br /> lottery than
          leaving this website unimpressed.
        </p>
        {/* <Link
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
        </Link> */}
      </div>
      <div className="absolute flex items-center justify-center inset-0 p-3 lg:p-5 z-20 text-[#d9d9d9] pointer-events-none">
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
        className="w-[150%] max-w-none lg:w-full z-0 absolute bottom-0"
        alt="Footer"
      />
    </div>
  );
}
