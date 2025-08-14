import Image from "next/image";
import Link from "next/link";
import SimpleMarquee from "@/components/simple-marquee";
import { gsap } from "@/lib/gsap";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type ProjectInfoType = {
  title: string;
  type: string;
  subbrand: string;
  category: string;
  year: string;
  image: string;
  slug: string;
};

export const projectInfo: ProjectInfoType[] = [
  {
    title: "Nike",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "nike",
  },
  {
    title: "Chrome Hearts",
    type: "Concept",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/ch.png",
    slug: "chrome-hearts",
  },
  {
    title: "Taco Bell",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "taco-bell",
  },
  {
    title: "McDonalds",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "mcdonalds",
  },
  {
    title: "Binance",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "binance",
  },
  {
    title: "Microsoft",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "microsoft",
  },
];

export function ProjectItem({
  title,
  type,
  subbrand,
  category,
  year,
  slug,
  image,
}: {
  title: string;
  type: string;
  subbrand: string;
  category: string;
  year: string;
  slug: string;
  image: string;
}) {
  const router = useRouter();

  return (
    <motion.div
      layout="position"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      onClick={() => {
        router.push(`?project=${slug}`, `/work/${slug}`, {
          scroll: false,
        });
      }}
      className={cn(
        "w-full cursor-pointer group border-y-[1px] border-white/20 flex flex-row items-center tracking-tighter relative z-10 overflow-hidden",
        `project-item-${slug}`
      )}
    >
      <span className="w-[50%] text-white text-6xl leading-[0.75]">
        {title}
      </span>
      <div
        style={{
          mask: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
        className="absolute w-1/2 top-1/2  h-full overflow-hidden right-0 translate-y-[100%] group-hover:-translate-y-1/2 transition-transform duration-300 ease-out"
      >
        <SimpleMarquee direction="left">
          {Array.from({ length: 10 }).map((_, index) => (
            <Image
              key={index}
              src={image}
              alt={title}
              width={500}
              height={500}
              className="w-auto h-11"
            />
          ))}
        </SimpleMarquee>
      </div>
      <div className="w-[50%] relative flex flex-row items-center justify-between gap-4 text-white text-sm overflow-hidden group-hover:translate-y-[100%] transition-transform duration-300 ease-out">
        <div className="flex-col">
          <span className="text-[#5E5E5E]">({type}) </span>
          <span className="text-white">{subbrand}</span>
        </div>
        <span className="">{category}</span>
        <div className="flex flex-row items-center gap-4">
          <Image
            src={image}
            alt={title}
            width={500}
            height={500}
            className="w-auto h-11"
          />
          <Link
            href={`/work/${slug}`}
            className="flex flex-row items-center gap-2 justify-self-end"
          >
            <span className="justify-self-end">{year}</span>
            <span className="block w-3">
              <svg
                width="100%"
                viewBox="0 0 10 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.37205 0.379864L9.37025 7.14139L8.7499 7.14156L8.75066 4.2903L8.75142 1.43904L1.60255 8.5879L1.16401 8.14936L8.31288 1.0005L2.61036 1.00202L2.61052 0.381663L9.37205 0.379864Z"
                  fill="white"
                  stroke="white"
                  stroke-width="0.5"
                  stroke-linecap="square"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeProjects() {
  const router = useRouter();
  const { project } = router.query;

  return (
    <div className="w-screen px-16 py-16 flex flex-col home-projects">
      <h2 className="text-white flex items-center gap-4 tracking-tight">
        <span>Work</span>
        <span className="w-11 h-[1px] bg-white"></span>
        <span>Year Database © 2012-{new Date().getFullYear()}</span>
      </h2>

      <motion.div
        layout
        className={cn(
          "w-full grid grid-cols-2 gap-8 mt-8",
          project && "grid-cols-1"
        )}
      >
        <AnimatePresence mode="sync">
          {projectInfo.map((projectData: ProjectInfoType) => {
            if (project && project !== projectData.slug) return null;
            return <ProjectItem key={projectData.slug} {...projectData} />;
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
