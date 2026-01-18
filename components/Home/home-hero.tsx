import Image from "next/image";
import TitleAndDesc from "../title-and-desc";

export default function HomeHero() {
  return (
    <section className="relative w-screen h-[110vh] flex items-end px-12 pb-[8%] home-hero">
      <TitleAndDesc
        delay={1.2}
        wrapperClassName="z-20"
        title="Our Studio"
        desc={
          <>
            We help visionary brands flourish <br />
            by crafting digital experiences that let <br />
            audiences feel the depth, elegance, and <br />
            essence of their products.
          </>
        }
      />

      <Image
        src="/static/images/flags.png"
        alt="BGImage"
        width={1920}
        quality={100}
        height={1080}
        priority
        className="absolute top-0 right-[-20%] rotate-[-15deg] w-auto h-full object-contain z-10"
      />
    </section>
  );
}
