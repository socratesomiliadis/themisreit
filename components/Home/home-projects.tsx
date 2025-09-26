import Image from "next/image";
import Link from "next/link";
import SimpleMarquee from "@/components/simple-marquee";
import { gsap } from "@/lib/gsap";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import ProjectHero from "../ProjectSingle/project-hero";

export type ProjectInfoType = {
  title: string;
  type: string;
  subbrand: string;
  category: string;
  year: string;
  image: string;
  slug: string;
  mainImage: string;
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
    mainImage: "/static/images/projectHero.png",
  },
  {
    title: "Chrome Hearts",
    type: "Concept",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/ch.png",
    slug: "chrome-hearts",
    mainImage: "/static/images/projectHero.png",
  },
  {
    title: "Taco Bell",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "taco-bell",
    mainImage: "/static/images/projectHero.png",
  },
  {
    title: "McDonalds",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "mcdonalds",
    mainImage: "/static/images/projectHero.png",
  },
  {
    title: "Binance",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "binance",
    mainImage: "/static/images/projectHero.png",
  },
  {
    title: "Microsoft",
    type: "Commission",
    subbrand: "1UP Nova",
    category: "Corporate",
    year: "2025",
    image: "/static/images/logo/tacoBell.png",
    slug: "microsoft",
    mainImage: "/static/images/projectHero.png",
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
  mainImage,
}: {
  title: string;
  type: string;
  subbrand: string;
  category: string;
  year: string;
  slug: string;
  image: string;
  mainImage: string;
}) {
  const router = useRouter();
  const lenis = useLenis();

  return (
    <div
      onClick={() => {
        // router.push(`/work/${slug}`, undefined, {
        //   scroll: false,
        // });
        const activeItem = document.querySelector(
          `.project-item-${slug}`
        ) as HTMLElement;
        router.prefetch(`/work/${slug}`);
        lenis?.scrollTo(activeItem, {
          offset: -128,
          lock: true,
          duration: 1.3,
          onComplete: () => {
            router.push(`/work/${slug}`, undefined, {
              scroll: false,
            });
          },
        });

        const tl = gsap.timeline();
        // const tl2 = gsap.timeline({
        //   scrollTrigger: {
        //     trigger: ".home-hero",
        //     start: "75% top",
        //     end: "95% top",
        //     onUpdate: (self) => {
        //       gsap.set(".project-back-btn-fill", {
        //         width: 100 - self.progress * 100 + "%",
        //       });
        //     },
        //     // onLeaveBack: () => {
        //     //   router.push("/", "/", {
        //     //     scroll: false,
        //     //   });
        //     // },
        //   },
        // });

        const itemParent = activeItem.parentElement;
        const itemImage = activeItem.querySelector(".project-item-image");
        const parentSibling = itemParent?.nextElementSibling;
        const parentPreviousSibling = itemParent?.previousElementSibling;

        tl.to(
          [`.project-item:not(.project-item-${slug})`, ".project-open-hide"],
          {
            opacity: 0,
            duration: 0.05,
          },
          0
        );
        tl.to(
          "main > *:not(.home-projects)",
          {
            opacity: 0,
            duration: 0.3,
            stagger: 0.025,
          },
          0
        );
        tl.to(
          itemImage,
          {
            opacity: 1,
            duration: 1,
          },
          0.3
        );

        tl.to(
          parentSibling ? parentSibling : parentPreviousSibling || "",
          {
            width: 0,
            padding: 0,
            duration: 1.3,
          },
          0.2
        );
        tl.to(
          itemParent,
          {
            padding: 0,
            duration: 1.3,
          },
          0.2
        );
        tl.to(
          itemParent,
          {
            width: "100%",
            duration: 1.3,
          },
          0.2
        );
      }}
      className={cn(
        "w-full min-w-[45vw] cursor-pointer group tracking-tighter relative z-10 project-item",
        `project-item-${slug}`
      )}
    >
      <div className="w-full border-y-[1px] border-white/20 flex flex-row items-center relative overflow-hidden">
        <span className="w-[50%] text-white text-6xl leading-[0.75]">
          {title}
        </span>
        <div
          style={{
            mask: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
          className="absolute w-1/2 top-1/2 h-full overflow-hidden right-0 translate-y-[100%] group-hover:-translate-y-1/2 transition-transform duration-300 ease-out"
        >
          <SimpleMarquee direction="left" className="gap-0">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="size-11 bg-purple-600 aspect-square flex items-center justify-center"
              >
                <Image
                  src={image}
                  alt={title}
                  width={500}
                  height={500}
                  className="w-2/3 h-auto max-h-2/3 object-contain"
                />
              </div>
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
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-20 w-screen max-w-none px-16 project-item-image opacity-0 pointer-events-none">
        <Image
          src={mainImage}
          alt={title}
          width={1920}
          height={1080}
          className="w-full object-cover  "
        />
      </div>
    </div>
  );
}

export default function HomeProjects() {
  const router = useRouter();
  const { project } = router.query;
  const firstHalfOfProjects = projectInfo.slice(0, 3);
  const secondHalfOfProjects = projectInfo.slice(3);

  return (
    <div className="w-screen px-16 py-16 flex flex-col home-projects">
      <h2 className="text-white flex items-center gap-4 tracking-tight project-open-hide">
        <span>Work</span>
        <span className="w-11 h-[1px] bg-white"></span>
        <span>Year Database © 2012-{new Date().getFullYear()}</span>
      </h2>

      {/* {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            scroll={false}
            className="text-white self-center bg-[#141414] rounded-full px-6 py-2 fixed left-1/2 -translate-x-1/2 top-10 z-[100] overflow-hidden"
          >
            Back
            <div className="absolute left-0 top-0 w-0 h-full bg-[#363636] z-[-1] project-back-btn-fill"></div>
          </Link>
        </motion.div>
      )} */}

      <div className={cn("w-full flex flex-row gap-0 mt-8")}>
        <div className="w-1/2 flex flex-col gap-8 pr-4">
          {firstHalfOfProjects.map((projectData: ProjectInfoType) => {
            return <ProjectItem key={projectData.slug} {...projectData} />;
          })}
        </div>
        <div className="w-1/2 flex flex-col gap-8 pl-4">
          {secondHalfOfProjects.map((projectData: ProjectInfoType) => {
            return <ProjectItem key={projectData.slug} {...projectData} />;
          })}
        </div>
      </div>
    </div>
  );
}
