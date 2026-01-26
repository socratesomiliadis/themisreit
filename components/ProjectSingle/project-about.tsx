import { ProjectBySlugQueryResult } from "@/sanity.types";
import { urlForImage } from "@/lib/sanity/sanity.image";
import Image from "next/image";

export default function ProjectAbout({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;

  const { description, exampleImages } = projectData;

  return (
    <section className="w-screen relative flex flex-col py-32 px-12 z-10">
      {/* Left Content */}

      {/* About Label */}
      <div className="flex items-center gap-2 text-[#707070] text-sm mb-4">
        <span className="text-base leading-none">+</span>
        <span>(About it)</span>
      </div>

      {/* Description */}
      <h2 className="text-[#434343] text-2xl lg:text-4xl tracking-tight font-light w-1/3">
        {description}
      </h2>

      {/* Examples & Work Label */}
      <div className="flex items-center gap-2 text-[#707070] text-sm mt-20 lg:mt-28">
        <span className="text-base leading-none">+</span>
        <span>Examples & Work</span>
      </div>
      <div className="flex flex-row gap-4 w-[90%] self-end">
        {exampleImages &&
          exampleImages.slice(0, 4).map((image, index) => {
            return (
              <Image
                className="object-contain"
                src={urlForImage(image)?.url() ?? ""}
                width={1920}
                height={1080}
                alt=""
              />
            );
          })}
      </div>

      {/* Scattered Images */}
    </section>
  );
}
