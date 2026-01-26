import { ProjectItem } from "@/components/Home/home-projects";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { ProjectBySlugQueryResult } from "@/sanity.types";
import Image from "next/image";
import TitleMarquee from "../title-marquee";
import SimpleMarquee from "../simple-marquee";

export default function ProjectHero({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;
  return (
    <section
      // style={{ backgroundColor: projectData.brandColor }}
      className="w-screen min-h-svh pt-32 z-10 relative flex flex-col justify-between"
    >
      <div className="w-full px-12">
        <ProjectItem
          key={projectData.slug.current}
          projectData={projectData}
          isProjectPage={true}
        />
      </div>
      <div className="w-full mt-8 px-12">
        <Image
          src={urlForImage(projectData.mainImage)?.url() ?? ""}
          alt=""
          priority
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="w-full flex flex-col gap-24 mt-24">
        <TitleMarquee title={projectData.title} number={1} />
        <SimpleMarquee
          baseVelocity={10}
          repeat={20}
          direction="left"
          className={"bg-black text-white py-2"}
        >
          <span className="uppercase text-sm pr-1">
            {projectData.title} BY PENSATORI IRRAZIONALI — SCROLL DOWN —
          </span>
        </SimpleMarquee>
      </div>
    </section>
  );
}
