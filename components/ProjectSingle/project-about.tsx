import { ProjectBySlugQueryResult } from "@/sanity.types";
import { urlForImage } from "@/lib/sanity/sanity.image";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export default function ProjectAbout({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { description, exampleImages } = projectData;

  const cursorRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    gsap.to(cursorRef.current, {
      left: event.clientX,
      top: event.clientY,
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  return (
    <section className="w-screen relative flex flex-col py-32 px-12 z-10">
      <div className="flex items-center gap-2 text-[#707070] text-sm mb-4">
        <span className="text-base leading-none">+</span>
        <span className="tracking-tight">(About it)</span>
      </div>

      <h2 className="text-[#434343] text-2xl lg:text-4xl tracking-tight font-[400] w-[35%]">
        {description}
      </h2>

      <div className="flex items-center gap-2 text-[#707070] text-sm mt-20 lg:mt-28">
        <span className="text-base leading-none">+</span>
        <span className="tracking-tight">(Examples & Work)</span>
      </div>
      <div
        ref={cursorRef}
        className={cn(
          "fixed size-14 gap-2 bg-white rounded-full flex flex-row items-center justify-center pointer-events-none text-black z-100 transition-opacity duration-200 ease-out",
          !isHovered && "opacity-0"
        )}
      >
        <span className="w-3 block">
          <svg
            width="100%"
            viewBox="0 0 7 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M-1.15007e-07 2.63065C-2.30293e-07 2.55588 0.0296999 2.48418 0.0825665 2.43132L2.43174 0.0821332C2.54183 -0.0279561 2.72032 -0.0279566 2.83041 0.0821327C2.9405 0.192222 2.9405 0.370711 2.83041 0.480801L0.962469 2.34875L6.48372 2.34875C6.63941 2.34875 6.76562 2.47496 6.76562 2.63065C6.76562 2.78634 6.63941 2.91255 6.48372 2.91255L0.962472 2.91255L2.83041 4.78048C2.9405 4.89057 2.9405 5.06906 2.83041 5.17915C2.72032 5.28924 2.54183 5.28924 2.43174 5.17915L0.0825671 2.82998C0.0297003 2.77712 2.78117e-10 2.70541 -1.15007e-07 2.63065Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="w-3 block">
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
      </div>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        drag="x"
        dragConstraints={{
          left: -500,
          right: 0,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        dragTransition={{
          bounceStiffness: 100,
          bounceDamping: 10,
        }}
        onDragStart={() => {
          setIsDragging(true);
          gsap.to(cursorRef.current, {
            scale: 0.8,
            duration: 0.2,
            ease: "power2.out",
          });
        }}
        onDragEnd={() => {
          setIsDragging(false);
          gsap.to(cursorRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "power2.in",
          });
        }}
        className={cn(
          "flex flex-col max-w-none -mt-[7%] pl-[15%] gap-0 example-gallery cursor-grab",
          isDragging && "cursor-grabbing"
        )}
      >
        <div className="flex flex-row gap-[5vw] pointer-events-none">
          {exampleImages &&
            exampleImages.slice(0, 4).map((image, index) => {
              return (
                <Image
                  key={index}
                  className={cn("object-contain", index === 0 && "mt-[15%]")}
                  src={urlForImage(image)?.url() ?? ""}
                  width={1920}
                  height={1080}
                  alt=""
                />
              );
            })}
        </div>
        <div className="flex flex-row gap-[5vw] pointer-events-none">
          {exampleImages &&
            exampleImages.slice(4, 8).map((image, index) => {
              return (
                <Image
                  key={index}
                  className={cn(
                    "object-contain w-[40%]",
                    index === 0 && "mt-[15%]",
                    index === 1 && "size-52 -ml-[18%]"
                  )}
                  src={urlForImage(image)?.url() ?? ""}
                  width={1920}
                  height={1080}
                  alt=""
                />
              );
            })}
        </div>
      </motion.div>
    </section>
  );
}
