import Image from "next/image";
import { gsap, SplitText } from "@/lib/gsap";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";

export default function HomeHero() {
  useIsomorphicLayoutEffect(() => {
    const split = SplitText.create(".home-hero-text", {
      type: "words, lines",
      linesClass: "home-hero-line",
      wordsClass: "home-hero-word",
      autoSplit: true,
      onSplit: (self) => {
        self.lines.forEach((line) => {
          gsap.set(line, {
            x: "1rem",
          });
        });
        self.words.forEach((word) => {
          gsap.set(word, {
            opacity: 0,
            filter: "blur(10px)",
          });
        });
        const tl = gsap.timeline({
          defaults: {
            duration: 1.2,
            ease: "power2.out",
          },
        });
        tl.set(".home-hero-text", {
          opacity: 1,
        });
        tl.to(
          self.lines,
          {
            x: 0,
            stagger: 0.1,
          },
          0
        );
        tl.to(
          [".home-hero-anim", self.words],
          {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.02,
          },
          0
        );
      },
    });
  }, []);

  return (
    <section className="relative z-10 w-screen h-screen flex items-end px-16 pb-16 home-hero overflow-hidden">
      <div className="flex flex-col gap-4 text-white tracking-tight">
        <span className="opacity-0 home-hero-anim blur translate-x-4">
          Our Studio
        </span>
        <p className="text-4xl font-[300] home-hero-text opacity-0 tracking-tight">
          We help visionary brands flourish <br />
          by crafting digital experiences that let <br />
          audiences feel the depth, elegance, and <br />
          essence of their products.
        </p>
      </div>
      <Image
        src="/static/images/flags.png"
        alt="BGImage"
        width={1238}
        height={1201}
        priority
        className="absolute top-0 right-0 w-auto h-full object-contain z-10"
      />

      <div className="size-72 rounded-full bg-[#0E1012] shadow-[0_4px_223px_435px_#0E1012] absolute top-[10%] right-[15%] z-[5]"></div>
    </section>
  );
}
