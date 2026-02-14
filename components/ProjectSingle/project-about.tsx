import { ProjectBySlugQueryResult } from "@/sanity.types";
import ProjectCollage from "@/components/ProjectSingle/project-collage";

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

  const { description, exampleImages } = projectData;
  const collageItemsFromStudio =
    (
      projectData as ProjectBySlugQueryResult & {
        collage?: { items?: CollageItem[] };
      }
    )?.collage?.items ?? [];
  const fallbackItemsFromExamples: CollageItem[] = (exampleImages ?? [])
    .slice(0, 8)
    .map((image, index) => ({
      _key: image._key || `example-${index}`,
      image: {
        _type: "image",
        asset: image.asset
          ? {
              _type: "reference",
              _ref: image.asset._ref,
            }
          : undefined,
      },
      x: 6 + (index % 4) * 23,
      y: 8 + Math.floor(index / 4) * 35 + (index % 2 ? 4 : 0),
      width: index % 3 === 0 ? 24 : 20,
      height: index % 2 === 0 ? 32 : 28,
      zIndex: index + 1,
    }));
  const collageItems =
    collageItemsFromStudio.length > 0
      ? collageItemsFromStudio
      : fallbackItemsFromExamples;

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
      <ProjectCollage items={collageItems} className="-mt-[5%]" />
    </section>
  );
}
