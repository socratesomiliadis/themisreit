import { ProjectItem } from "@/components/Home/home-projects";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { ProjectBySlugQueryResult } from "@/sanity.types";
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
        key={projectData.slug.current}
        projectData={projectData}
        isProjectPage={true}
      />
      <div className="w-full mt-8">
        <Image
          src={urlForImage(projectData.mainImage)?.url() ?? ""}
          alt=""
          priority
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
        />
      </div>
    </section>
  );
}
