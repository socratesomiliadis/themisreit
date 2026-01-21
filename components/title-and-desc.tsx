"use client";

import Image from "next/image";
import { gsap, SplitText } from "@/lib/gsap";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export default function TitleAndDesc({
  title,
  desc,
  wrapperClassName,
  titleClassName,
  descClassName,
  delay,
  playOnScroll = false,
}: {
  title: string;
  desc: React.ReactNode;
  wrapperClassName?: string;
  titleClassName?: string;
  descClassName?: string;
  delay?: number;
  playOnScroll?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    let tl: GSAPTimeline;
    const text = wrapperRef.current?.querySelector(
      ".title-and-desc-text"
    ) as HTMLParagraphElement;
    const title = wrapperRef.current?.querySelector(
      ".title-and-desc-title"
    ) as HTMLSpanElement;

    const split = SplitText.create(text, {
      type: "words, lines",
      linesClass: "title-and-desc-line",
      wordsClass: "title-and-desc-word",
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
        tl = gsap.timeline({
          delay: delay || 0,
          scrollTrigger: playOnScroll
            ? {
                trigger: wrapperRef.current,
                start: "top 75%",
              }
            : undefined,
          defaults: {
            duration: 1.2,
            ease: "power2.out",
          },
        });
        tl.set(text, {
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
          [title, self.words],
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

    return () => {
      split.revert();
      tl?.kill();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex flex-col gap-4 text-black tracking-tight",
        wrapperClassName
      )}
    >
      <span
        className={cn(
          "opacity-0 title-and-desc-title blur translate-x-4 text-sm",
          titleClassName
        )}
      >
        {title}
      </span>
      <p
        className={cn(
          "text-4xl font-[300] title-and-desc-text opacity-0 tracking-tight leading-none",
          descClassName
        )}
      >
        {desc}
      </p>
    </div>
  );
}
