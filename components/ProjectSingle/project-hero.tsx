import { ProjectItem } from "@/components/Home/home-projects";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { Project, ProjectBySlugQueryResult } from "@/sanity.types";
import { motion } from "motion/react";
import Image from "next/image";

export default function ProjectHero({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;
  return (
    <section className="w-screen min-h-[150vh] pt-32 px-16 z-10 relative">
      <ProjectItem
        key={projectData.slug?.current}
        title={projectData.title ?? ""}
        type={projectData.projectOrigin?.type ?? ""}
        subbrand={projectData.projectOrigin?.subbrand ?? ""}
        category={projectData.category?.title ?? ""}
        year={projectData.year ?? ""}
        slug={projectData.slug?.current ?? ""}
        logo={urlForImage(projectData.logo)?.url() ?? ""}
        mainImage={urlForImage(projectData.mainImage)?.url() ?? ""}
        marqueeLogo={urlForImage(projectData.logoMarquee)?.url() ?? ""}
        brandColor={projectData.brandColor ?? ""}
        isProjectPage={true}
      />
      <motion.div
        // initial={{ opacity: 0, filter: "blur(16px)" }}
        // animate={{ opacity: 1, filter: "blur(0px)" }}
        // exit={{ opacity: 0, filter: "blur(16px)" }}
        // transition={{ duration: 0.4 }}
        className="w-full mt-8"
      >
        <Image
          src={urlForImage(projectData.mainImage)?.url() ?? ""}
          alt=""
          priority
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
        />
      </motion.div>
    </section>
  );
}
