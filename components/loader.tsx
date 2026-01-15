"use client";

import Image from "next/image";
import { gsap, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { Fragment,
useState, useRef } from "react";
import { useLenis } from "lenis/react";
import ScrambleIn from "@/components/scramble-in";
import Pensatori from "./SVGs/pensatori-logo";

const LEFT_LIST = [
  "Websites",
  "Metaverse",
  "Content",
  "Brands",
  "Animations",
  "3D Models",
  "AR & VR",
];

const RIGHT_LIST = [
  "Since 2019",
  "Since 2017",
  "Since 2022",
  "Since 2018",
  "Since 2013",
  "Since 2018",
  "Since 2017",
];

// Data structure for loader box rows
const LOADER_ROWS = [
  {
    left: [
      ["OPTION SET 1", "SYSTEM / STUDIO CORE"],
      ["DESIGN / TECHNOLOGY / CULTURE", "POST-DEPLOYMENT / PRE-STABILITY"],
    ],
    rightText: [
      "Recursive Diagram of One Studio System",
      "(left to right) for speculative practice,",
      "becoming a container for identity, technology, and form",
      "as an active ecology.",
    ],
    rightBox: [
      ["IDENTITY / MODULE 01", "ID: STUDIO–ID–A01"],
      [
        "A container for intention.",
        "Form emerges before explanation.",
        "Identity stabilizes only through repetition.",
      ],
    ],
  },
  {
    left: [
      ["OPTION SET 2", "PROCESS / LOADING STATE"],
      ["SYSTEM STATUS: INITIALIZING", "MODE: SPECULATIVE"],
    ],
    rightText: [
      "Each module operates independently,",
      "yet remains influenced by adjacent structures.",
      "Failure, delay, and recursion",
      "are treated as generative forces.",
    ],
    rightBox: [
      ["SYSTEMS / MODULE 02", "ID: SYS–CORE–B07"],
      [
        "Systems are not designed.",
        "They are discovered through constraints.",
        "Failure refines the architecture.",
      ],
    ],
  },
  {
    left: [
      ["OPTION SET 3", "FORM / IDENTITY"],
      [
        "IDENTITY / FORM / SIGNAL - ASSEMBLED OVER TIME",
        "POST-INTERFACE CONDITION",
      ],
    ],
    rightText: [
      "Form is treated as a consequence",
      "of accumulated decisions and constraints.",
      "No single element retains autonomy.",
      "Stability is temporary.",
    ],
    rightBox: [
      ["IDENTITY / MODULE 03", "ID: UI–THRESHOLD–C12"],
      [
        "An interface is a negotiation",
        "between machine logic",
        "and human instinct.",
      ],
    ],
  },
  {
    left: [
      ["OPTION SET 4", "INTERFACE / MEDIATION"],
      [
        "INTERFACE / EMBODIMENT - ACTIVE FEEDBACK LOOP",
        "CALIBRATION IN PROGRESS",
      ],
    ],
    rightText: [
      "Diagram of Mediation Between Human and Machine",
      "where interfaces function as negotiation zones",
      "rather than solutions.",
    ],
    rightBox: [
      ["NARRATIVE / MODULE 04", "ID: NAR–SEQ–D09"],
      [
        "Narrative is not linear.",
        "It folds, repeats, and leaks",
        "across mediums.",
      ],
    ],
  },
  {
    left: [
      ["OPTION SET 5", "ARCHIVE / MEMORY"],
      ["ARCHIVE / SYSTEM MEMORY", "READ-WRITE STATE, NON-FINAL RECORD"],
    ],
    rightText: [
      "Diagram of Mediation Between Human and Machine",
      "where interfaces function as negotiation zones",
      "rather than solutions.",
    ],
    rightBox: [
      ["FORM / MODULE 05", "ID: FORM–FIELD–E03"],
      ["Form is a consequence,", "not a decision.", "Shape follows pressure."],
    ],
  },
];

// Helper component to render scrambled text blocks
function ScrambleBlock({
  lines,
  scramble = true,
}: {
  lines: string[];
  scramble?: boolean;
}) {
  return (
    <p>
      {lines.map((line, i) => (
        <span key={i}>
          {scramble ? <ScrambleIn text={line} scrambleSpeed={30} /> : line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

function JustifiedText({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const ref = useRef<HTMLParagraphElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const split = SplitText.create(ref.current, {
      type: "words, lines",
      linesClass: "justified-line",
      autoSplit: true,
      onSplit: (self) => {
        gsap.set(ref.current, {
          opacity: 1,
        });
        self.lines.forEach((line) => {
          (line as HTMLElement).style.display = "flex";
          (line as HTMLElement).style.justifyContent = "space-between";
        });
      },
    });

    return () => {
      split.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <p ref={ref} {...props}>
      {children}
    </p>
  );
}

function LoaderBoxRow({
  left,
  rightText,
  rightBox,
}: {
  left: string[][];
  rightText: string[];
  rightBox: string[][];
}) {
  return (
    <>
      <div className="col-span-2 border-[#282828] border flex flex-row gap-8 justify-between p-3">
        <div className="flex flex-col h-full justify-between text-white text-xs tracking-tight">
          {left.map((block, i) => (
            <ScrambleBlock key={i} lines={block} />
          ))}
        </div>
        <div className="flex flex-col justify-between w-[65%]">
          <JustifiedText className="text-[#5E5E5E] w-full opacity-0 text-xs tracking-tight">
            T1 2 3 4 5 6 7
          </JustifiedText>
          <JustifiedText className="text-[#5E5E5E] w-full opacity-0 text-xs tracking-tight">
            {rightText.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < rightText.length - 1 && <br />}
              </Fragment>
            ))}
          </JustifiedText>
          <JustifiedText className="text-[#5E5E5E] w-full opacity-0 text-xs tracking-tight">
            WIT BWIT FNOS SNOS <br /> Diagram By Pensatori Irrazionale
          </JustifiedText>
        </div>
      </div>
      <div className="col-span-1 border-[#282828] border flex flex-row gap-8 justify-between p-3">
        <div className="flex flex-col h-full justify-between text-white text-xs tracking-tight leading-[1.05]">
          {rightBox.map((block, i) => (
            <ScrambleBlock key={i} lines={block} />
          ))}
        </div>
        <div className="flex flex-col h-full justify-between text-white text-xs tracking-tight">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex flex-row items-center gap-2">
              <ScrambleIn
                text={`${(index + 1)
                  .toString()
                  .padStart(2, "0")} STATUS / ACTIVE`}
                scrambleSpeed={30}
              />
              <div className="size-3 rounded-full bg-[#282828]"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function renderCurvedList(items: string[], side: "left" | "right") {
  const mid = Math.floor(items.length / 2);
  return items.map((item, index) => {
    return (
      <div
        style={{
          transform:
            mid === index
              ? "translateX(0%)"
              : index < mid
              ? `translateX(${
                  side === "left" ? (mid - index) * 8 : -((mid - index) * 8)
                }%)`
              : `translateX(${
                  side === "left" ? -(mid - index) * 8 : (mid - index) * 8
                }%)`,
        }}
        className={`loader-list-item-${side} tracking-tight`}
        key={index}
      >
        {item}
      </div>
    );
  });
}

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  useIsomorphicLayoutEffect(() => {
    const loaderTl = gsap.timeline({
      onUpdate: () => {
        setProgress(Math.round(loaderTl.progress() * 100));
      },
      onComplete: () => {
        // gsap.to(".loader-wrapper", {
        //   opacity: 0,
        //   duration: 1,
        //   delay: 0.2,
        //   ease: "power2.out",
        // });
        // gsap.set(".loader-wrapper", {
        //   pointerEvents: "none",
        // });
        // lenis?.start();
        const closeTl = gsap.timeline({
          onComplete: () => {
            lenis?.start();
          },
        });
        closeTl.to(".loader-blind", {
          width: "100%",
          duration: 1.2,
          stagger: 0,
        });
        closeTl.to(
          ".blind-expand",
          {
            scaleY: 1.2,
            duration: 1,
            stagger: 0,
          },
          "<+=0.2"
        );
        closeTl.to(
          ".loader-close-logo",
          {
            opacity: 1,
            duration: 1,
          },
          "<+=0.5"
        );
        closeTl.to(".loader-wrapper", {
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: "power2.out",
        });
        closeTl.set(".loader-wrapper", {
          pointerEvents: "none",
        });
      },
    });
    const rotateTween = gsap.to(".loader-rotate", {
      rotate: -360,
      duration: 40,
      repeat: -1,
      ease: "linear",
    });
    loaderTl.to(".loader-circle", {
      scale: 1,
      duration: 1,
      stagger: 0.05,
    });
    loaderTl.to(
      ".loader-circle-secondary",
      {
        opacity: 1,
        duration: 0.6,
        stagger: 0.02,
      },
      0.4
    );
    // loaderTl.from(
    //   ".loader-list-item-left",
    //   {
    //     x: "-150%",
    //     duration: 0.8,
    //     stagger: 0.05,
    //   },
    //   0.2
    // );
    // loaderTl.from(
    //   ".loader-list-item-right",
    //   {
    //     x: "150%",
    //     duration: 0.8,
    //     stagger: 0.05,
    //   },
    //   0.2
    // );
    loaderTl.to(".loader-wrapper", {
      duration: 0.8,
    });

    return () => {
      loaderTl.kill();
      rotateTween.kill();
    };
  }, [lenis]);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#111111] overflow-hidden loader-wrapper">
      <div className="absolute loader-close-wrapper w-full h-full z-22 flex flex-col gap-4 p-4">
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-24 z-22 loader-close-logo opacity-0">
          <Pensatori />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-0 basis-1/5 bg-white loader-blind",
              i !== 0 && i !== 4 && "blind-expand"
            )}
          ></div>
        ))}
      </div>
      <div className="absolute w-full h-full grid grid-cols-3 p-4 gap-4 z-20">
        {LOADER_ROWS.map((row, i) => (
          <LoaderBoxRow
            key={i}
            left={row.left}
            rightText={row.rightText}
            rightBox={row.rightBox}
          />
        ))}
      </div>
      <div className="relative z-21 flex items-center gap-12 opacity-100">
        <div className="relative max-w-full h-[calc(100vh-0rem)] aspect-square flex items-center justify-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: `${50 + i * 14}%`,
              }}
              className={cn(
                "absolute h-[55%] aspect-square rounded-full border border-white/60 scale-0 loader-circle",
                i === 0 && "bg-white z-10",
                i === 3 &&
                  "flex items-center justify-center overflow-hidden z-5"
              )}
            >
              {i === 0 && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                  <div className="flex flex-col items-center text-black relative z-10">
                    <span className="font-ballet text-[2.5vw] leading-tight">
                      Loading
                    </span>
                    {/* <video
                      src="/static/videos/loading.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-[60%]"
                    /> */}
                    <span className="font-helvetica-now text-[0.6vw] mb-2 absolute top-0 left-[84%] tabular-nums">
                      ({progress}%)
                    </span>
                  </div>
                  <div className="absolute left-4 flex flex-col gap-2 text-xs text-black font-helvetica-now text-left">
                    {renderCurvedList(LEFT_LIST, "left")}
                  </div>
                  <div className="absolute right-4 flex flex-col gap-2 text-xs text-black font-helvetica-now text-right">
                    {renderCurvedList(RIGHT_LIST, "right")}
                  </div>
                </div>
              )}
              {i === 3 && (
                <div className="relative w-full h-full loader-rotate">
                  <Image
                    src="/static/images/loaderImage2.png"
                    alt="Logo"
                    width={800}
                    height={800}
                    priority
                    className="w-1/2 aspect-square top-0 left-0 absolute"
                  />
                  <Image
                    src="/static/images/loaderImage1.png"
                    alt="Logo"
                    width={800}
                    height={800}
                    priority
                    className="w-1/2 aspect-square bottom-0 right-0 absolute"
                  />
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: 34 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: `${59 + i * 1}%`,
              }}
              className={cn(
                "absolute h-[55%] aspect-square rounded-full border border-white/10 pointer-events-none z-0 opacity-0 loader-circle-secondary"
              )}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
