import { urlForImage } from "@/lib/sanity/sanity.image";
import { ProjectBySlugQueryResult } from "@/sanity.types";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/gsap";

function GalleryItem({
  image,
  index,
  brandColor,
}: {
  image: any;
  index: number;
  brandColor: string;
}) {
  return (
    <div
      key={image._key}
      style={{ backgroundColor: brandColor }}
      className="relative h-fit w-full group "
    >
      <span className="text-white absolute left-12 top-12 text-2xl z-10 opacity-0 blur-sm group-hover:blur-none group-hover:opacity-100 transition-[opacity, filter] duration-300 ease-out">
        {index + 1}
      </span>
      <div className="absolute inset-0 z-5 group-hover:p-6 transition-padding duration-300 ease-out">
        <Image
          src={urlForImage(image)?.url() ?? ""}
          alt=""
          width={1080}
          height={1080}
          className="w-full h-full object-cover"
        />
      </div>
      <Image
        src={urlForImage(image)?.url() ?? ""}
        onLoad={() => {
          if (index === 0) ScrollTrigger.refresh();
        }}
        alt=""
        width={1080}
        height={1080}
        className="w-full h-auto object-contain pointer-events-none opacity-0"
      />
    </div>
  );
}

export default function ProjectGallery({
  projectData,
}: {
  projectData: ProjectBySlugQueryResult;
}) {
  if (!projectData) return null;

  const { gallery, galleryDescription, brandColor } = projectData;

  return (
    <section className="w-screen relative flex flex-col gap-16 py-16 px-12 z-10">
      <div className="grid grid-cols-2 gap-8">
        {gallery?.map((image, index) => (
          <GalleryItem
            key={image._key}
            image={image}
            index={index}
            brandColor={brandColor}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center gap-2 text-[#707070] text-sm mb-4">
          <span className="text-base leading-none">+</span>
          <span className="tracking-tight">(About it)</span>
        </div>

        <h2 className="text-[#434343] text-2xl lg:text-4xl tracking-tight font-[400] w-[35%]">
          {galleryDescription}
        </h2>
      </div>
    </section>
  );
}
