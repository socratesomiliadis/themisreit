"use client";

import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  NextProjectQueryResult,
  ProjectBySlugQueryResult,
  ProjectsQueryResult,
} from "@/sanity.types";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { useLenis } from "lenis/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ProjectItem({
  projectData,
  progress,
}: {
  projectData: ProjectsQueryResult[0];
  progress: number;
}) {
  return (
    <div className="w-full relative tracking-tighter">
      <span className="absolute -top-5 -ml-5 font-some-type-mono text-sm project-next-percentage">
        {progress}%
      </span>

      {/* <span className="text-[#434343] text-6xl leading-[0.75] absolute left-0 opacity-0 project-next-hid">
        {projectData.title}
      </span> */}
      <div className="w-full border-y border-[#303030]/10 flex flex-row items-center relative overflow-hidden">
        <div className="h-full bg-[#434343] w-0 absolute left-0 top-0 z-10 project-next-progress"></div>
        <div className="w-[52%] h-fit text-[#434343] text-6xl leading-[0.75] opacity-0 pointer-events-none">
          {projectData.title}
        </div>
        <span className="text-[#434343] text-6xl leading-[0.75] absolute z-10 left-0 translate-y-[105%] project-next-hid">
          {projectData.title}
        </span>
        <div className="w-[48%] translate-y-[105%] project-next-hid relative grid grid-cols-4 whitespace-nowrap items-center gap-4 text-[#434343] text-sm overflow-hidden transition-transform duration-300 ease-out">
          <div className="flex-col col-span-2">
            <span className="text-[#5E5E5E]">
              ({projectData.projectOrigin.type}){" "}
            </span>
            <span className="text-[#434343]">
              {projectData.projectOrigin.subbrand}
            </span>
          </div>
          <span className="">{projectData.category.title}</span>
          <div className="flex flex-row items-center gap-6 justify-center relative">
            <Image
              src={urlForImage(projectData.logo)?.url() ?? ""}
              alt={projectData.title}
              width={500}
              height={500}
              className="w-auto h-11 invert"
            />
            <div className="flex flex-row items-center gap-2 justify-self-end absolute right-0">
              <span className="block w-3 text-[#5E5E5E]">
                <svg
                  width="100%"
                  viewBox="0 0 10 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.37205 0.379864L9.37025 7.14139L8.7499 7.14156L8.75066 4.2903L8.75142 1.43904L1.60255 8.5879L1.16401 8.14936L8.31288 1.0005L2.61036 1.00202L2.61052 0.381663L9.37205 0.379864Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeLinecap="square"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectNext({
  nextProject,
}: {
  nextProject: ProjectBySlugQueryResult;
}) {
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useIsomorphicLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".project-next",
        start: "top 70%",
        end: "99.9% bottom",
        scrub: 0,
        onUpdate: (self) => {
          gsap.to(".project-next-progress", {
            width: `${Math.ceil(self.progress * 100)}%`,
            duration: 0.3,
            ease: "none",
          });
          gsap.to(".project-next-percentage", {
            left: `${Math.ceil(self.progress * 100)}%`,
            duration: 0.3,
            ease: "none",
          });
          setProgress(Math.round(self.progress * 100));
        },
      },
      onComplete: () => {
        lenis?.stop();
        const tl = gsap.timeline({
          onComplete: () => {
            router.push(`/work/${nextProject?.slug.current}`);
          },
        });
        tl.to(
          ".project-next-percentage",
          {
            opacity: 0,
            duration: 0.6,
          },
          0
        );
        tl.to(
          ".project-next-progress",
          {
            y: "-105%",
            duration: 0.6,
          },
          0
        );
        tl.fromTo(
          ".project-next-hid",

          {
            y: "105%",
            duration: 0.6,
          },
          {
            y: 0,
            stagger: 0,
            duration: 0.6,
          },
          0.35
        );
      },
    });
    tl.to(".next-item", {
      scale: (index: number) => 1 - index / 9,
      yPercent: (index: number) => index * 10,
      ease: "none",
    });
    tl.to(
      ".next-image",
      {
        scale: 1,
        ease: "none",
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [lenis]);

  return (
    <>
      <div className="w-screen h-screen overflow-hidden relative project-next pt-40 px-12 z-10">
        <ProjectItem
          key={nextProject?.slug.current}
          progress={progress}
          projectData={nextProject!}
        />
        <div className="relative w-full next-wrapper z-1 mt-9">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="text-[#d9d9d9] origin-bottom absolute w-full next-item"
            >
              <svg
                width="100%"
                className="relative z-1"
                viewBox="0 0 1787 232"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 5.26514H48.3155L140.611 153.619H141.23V5.26514H186.758V226.402H138.133L46.1475 78.3578H45.5281V226.402H0V5.26514Z"
                  fill="currentColor"
                />
                <path
                  d="M202.566 5.26514H367.953V46.1475H251.191V93.5339H358.352V131.319H251.191V185.519H370.431V226.402H202.566V5.26514Z"
                  fill="currentColor"
                />
                <path
                  d="M375.522 5.26514H431.89L475.25 75.8801L520.159 5.26514H573.43L502.505 110.878L579.624 226.402H521.707L473.392 149.902L424.147 226.402H369.328L446.756 110.568L375.522 5.26514Z"
                  fill="currentColor"
                />
                <path
                  d="M570.95 5.26514H752.133V46.1475H685.854V226.402H637.229V46.1475H570.95V5.26514Z"
                  fill="currentColor"
                />
                <path
                  d="M845.868 5.26514H894.493L929.491 155.787H930.11L968.515 5.26514H1014.04L1051.83 157.645H1052.45L1088.68 5.26514H1136.38L1076.92 226.402H1028.6L991.124 75.8801H990.505L953.649 226.402H904.404L845.868 5.26514Z"
                  fill="currentColor"
                />
                <path
                  d="M1250.05 0C1316.95 0 1358.76 49.8641 1358.76 116.762C1358.76 181.183 1317.57 231.667 1250.05 231.667C1182.53 231.667 1141.34 181.183 1141.34 116.762C1141.34 51.1029 1182.23 0 1250.05 0ZM1189.97 116.762C1189.97 157.955 1209.48 190.784 1250.05 190.784C1291.24 190.784 1310.14 157.025 1310.14 116.762C1310.14 74.3315 1291.24 40.8823 1249.74 40.8823C1209.17 40.8823 1189.97 74.0218 1189.97 116.762Z"
                  fill="currentColor"
                />
                <path
                  d="M1374.16 5.26514H1493.4C1532.43 5.26514 1558.13 32.2103 1558.13 66.279C1558.13 94.1533 1546.36 112.426 1523.13 121.718V122.337C1554.11 131.009 1555.03 165.078 1555.96 185.829C1556.89 206.889 1559.06 218.659 1564.64 226.402H1516.01C1512.29 217.11 1511.06 203.792 1509.82 187.997C1507.34 157.025 1502.38 139.991 1471.72 139.991H1422.79V226.402H1374.16V5.26514ZM1422.79 105.303H1476.37C1496.81 105.303 1509.51 96.9407 1509.51 73.7121C1509.51 51.7224 1497.43 43.0504 1476.06 43.0504H1422.79V105.303Z"
                  fill="currentColor"
                />
                <path
                  d="M1582.84 5.26514H1631.46V96.9407L1717.87 5.26514H1778.58L1692.17 92.6047L1786.94 226.402H1725.92L1659.34 126.983L1631.46 155.167V226.402H1582.84V5.26514Z"
                  fill="currentColor"
                />
              </svg>

              <div className="h-[115%] bg-[#f5f5f5] absolute w-[103%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-[48%] z-0"></div>
            </div>
          ))}
          <svg
            width="100%"
            className="opacity-0 pointer-events-none"
            viewBox="0 0 2708 296"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 288.684V6.71357H52.129L180.872 214.44H181.662V6.71357H228.657V288.684H176.528L48.1798 81.3528H46.9951V288.684H0Z"
              fill="currentColor"
            />
            <path
              d="M267.232 288.684V6.71357H470.219V49.3646H316.597V123.214H458.767V163.495H316.597V246.033H472.984V288.684H267.232Z"
              fill="currentColor"
            />
            <path
              d="M564.953 142.565L471.753 6.71357H530.595L594.572 106.233L661.313 6.71357H716.601L623.401 142.565L723.314 288.684H663.287L592.992 180.872L521.512 288.684H465.039L564.953 142.565Z"
              fill="currentColor"
            />
            <path
              d="M705.716 49.3646V6.71357H933.978V49.3646H844.332V288.684H794.967V49.3646H705.716Z"
              fill="currentColor"
            />
            <path
              d="M1086.45 46.9951V140.195H1158.72C1171.89 140.195 1182.94 136.904 1191.9 130.322C1202.69 122.161 1208.09 109.918 1208.09 93.5952C1208.09 62.5285 1191.9 46.9951 1159.51 46.9951H1086.45ZM1037.09 288.684V6.71357H1161.49C1197.29 6.71357 1223.36 16.8498 1239.68 37.1222C1251.53 51.8657 1257.45 70.8217 1257.45 93.9901C1257.45 116.895 1251.53 135.588 1239.68 150.068C1223.36 170.341 1197.29 180.477 1161.49 180.477H1086.45V288.684H1037.09Z"
              fill="currentColor"
            />
            <path
              d="M1330.11 46.9951V135.061H1411.07C1443.19 135.061 1459.25 120.055 1459.25 90.041C1459.25 61.3437 1442.93 46.9951 1410.28 46.9951H1330.11ZM1280.75 288.684V6.71357H1415.42C1445.96 6.71357 1469.12 13.4271 1484.92 26.8543C1500.72 40.0182 1508.62 58.7109 1508.62 82.9325C1508.62 119.528 1493.08 143.223 1462.02 154.017V154.807C1489.92 158.756 1503.88 178.634 1503.88 214.44C1503.88 252.878 1509.01 277.626 1519.28 288.684H1466.36C1461.36 280.522 1458.86 266.7 1458.86 247.218C1458.86 220.1 1455.17 201.144 1447.8 190.35C1439.64 178.502 1424.63 172.579 1402.78 172.579H1330.11V288.684H1280.75Z"
              fill="currentColor"
            />
            <path
              d="M1659.12 0C1700.19 0 1733.23 14.4803 1758.24 43.4408C1782.2 71.3482 1794.18 106.101 1794.18 147.699C1794.18 189.297 1782.2 223.918 1758.24 251.562C1733.23 280.786 1700.19 295.398 1659.12 295.398C1618.05 295.398 1585.01 280.786 1559.99 251.562C1536.04 223.918 1524.06 189.297 1524.06 147.699C1524.06 106.101 1536.04 71.3482 1559.99 43.4408C1585.01 14.4803 1618.05 0 1659.12 0ZM1659.12 40.2815C1630.95 40.2815 1609.1 51.4708 1593.56 73.8494C1580.14 93.3319 1573.42 117.948 1573.42 147.699C1573.42 177.449 1580.14 202.066 1593.56 221.548C1609.1 243.927 1630.95 255.116 1659.12 255.116C1687.29 255.116 1709.14 243.927 1724.67 221.548C1738.1 202.066 1744.82 177.449 1744.82 147.699C1744.82 117.948 1738.1 93.3319 1724.67 73.8494C1709.14 51.4708 1687.29 40.2815 1659.12 40.2815Z"
              fill="currentColor"
            />
            <path
              d="M1971.41 6.71357V197.853C1971.41 227.604 1966.01 249.982 1955.21 264.989C1940.73 285.261 1915.2 295.398 1878.6 295.398C1850.17 295.398 1828.71 286.709 1814.23 269.333C1801.06 253.8 1794.48 232.343 1794.48 204.962V189.955H1843.85V204.567C1843.85 221.417 1846.61 233.791 1852.14 241.689C1858.2 250.64 1868.33 255.116 1882.55 255.116C1897.82 255.116 1908.35 250.377 1914.14 240.899C1919.41 233.001 1922.04 219.574 1922.04 200.618V6.71357H1971.41Z"
              fill="currentColor"
            />
            <path
              d="M2011.73 288.684V6.71357H2214.72V49.3646H2061.09V123.214H2203.26V163.495H2061.09V246.033H2217.48V288.684H2011.73Z"
              fill="currentColor"
            />
            <path
              d="M2480.45 96.3596H2431.08C2421.61 58.9742 2398.18 40.2815 2360.79 40.2815C2332.62 40.2815 2310.77 51.4708 2295.23 73.8494C2281.81 93.3319 2275.09 117.948 2275.09 147.699C2275.09 177.449 2281.81 202.066 2295.23 221.548C2310.77 243.927 2332.62 255.116 2360.79 255.116C2381.85 255.116 2398.83 247.876 2411.73 233.396C2423.58 220.232 2430.56 202.855 2432.66 181.267H2480.84C2478.74 215.23 2466.63 242.742 2444.51 263.804C2422.66 284.867 2394.75 295.398 2360.79 295.398C2319.72 295.398 2286.68 280.786 2261.67 251.562C2237.71 223.918 2225.73 189.297 2225.73 147.699C2225.73 105.838 2237.71 71.085 2261.67 43.4408C2286.68 14.4803 2319.72 0 2360.79 0C2393.17 0 2420.29 8.42488 2442.14 25.2746C2464.78 42.9143 2477.55 66.6093 2480.45 96.3596Z"
              fill="currentColor"
            />
            <path
              d="M2479.14 49.3646V6.71357H2707.4V49.3646H2617.75V288.684H2568.39V49.3646H2479.14Z"
              fill="currentColor"
            />
          </svg>
        </div>
        {nextProject && (
          <Image
            src={urlForImage(nextProject.mainImage)?.url() ?? ""}
            alt={nextProject.title}
            width={1920}
            height={1080}
            className="w-[calc(100%-6rem)] absolute top-60 left-1/2 -translate-x-1/2 origin-bottom scale-10 z-10 next-image"
          />
        )}
        {/* <div
        style={{
          backgroundColor: nextProject?.brandColor,
        }}
        className="w-full h-0 absolute bottom-0 left-0 z-0 next-brand-color"
      ></div> */}
      </div>
    </>
  );
}
