import { ProjectBySlugQueryResult } from "@/sanity.types";
import ProjectCollage from "@/components/ProjectSingle/project-collage";
import { PortableText } from "next-sanity";

type CollageItem = {
  _key: string;
  image?: {
    asset?: {
      _ref?: string;
      _type: "reference";
    };
    _type: "image";
  };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
};

export default function ProjectAbout({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;

  const { description } = projectData;
  const collageItemsFromStudio =
    (
      projectData as ProjectBySlugQueryResult & {
        collage?: { items?: CollageItem[] };
      }
    )?.collage?.items ?? [];

  const collageItems =
    collageItemsFromStudio.length > 0 ? collageItemsFromStudio : [];

  return (
    <section className="w-screen relative flex flex-col py-32 px-12 z-10">
      <div className="flex items-center gap-2 text-[#707070] text-sm mb-4">
        <span className="text-base leading-none">+</span>
        <span className="tracking-tight">(About it)</span>
      </div>

      <div className="text-[#434343] text-2xl lg:text-4xl tracking-tight font-[400] w-[45%] text-balance">
        <PortableText value={description ?? []} />
      </div>

      <div className="flex items-center gap-2 text-[#707070] text-sm mt-20 lg:mt-28">
        <span className="text-base leading-none">+</span>
        <span className="tracking-tight">(Examples & Work)</span>
      </div>
      <ProjectCollage items={collageItems} className="-mt-[5%]" />
    </section>
  );
}
