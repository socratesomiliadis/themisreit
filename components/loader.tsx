"use client";

import Image from "next/image";
import { gsap, SplitText, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { Fragment, useState, useRef } from "react";
import { useLenis } from "lenis/react";
import ScrambleIn from "@/components/scramble-in";
import Pensatori from "./SVGs/pensatori-logo";
import useNavigateTransition from "@/hooks/useNavigateTransition";
import { usePathname } from "next/navigation";

const LEFT_LIST = [
  "Websites",
  "Metaverse",
  "Content",
  "Games",
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
  "Since 2016",
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
  scramble = false,
  scrambleSpeed = 200,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  scramble?: boolean;
  scrambleSpeed?: number;
}) {
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

        // Apply scramble effect to each word if enabled
        if (scramble) {
          const chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+";
          const scrambledLetterCount = 1;

          self.words.forEach((wordEl, wordIndex) => {
            const element = wordEl as HTMLElement;
            const originalText = element.textContent || "";
            const textLength = originalText.length;

            // Set up structure: invisible placeholder + visible animated overlay
            element.style.position = "relative";
            element.innerHTML = "";

            // Invisible placeholder to maintain layout
            const placeholder = document.createElement("span");
            placeholder.textContent = originalText;
            placeholder.style.visibility = "hidden";
            element.appendChild(placeholder);

            // Visible animated text positioned on top
            const animatedSpan = document.createElement("span");
            animatedSpan.style.position = "absolute";
            animatedSpan.style.left = "0";
            animatedSpan.style.top = "0";
            animatedSpan.textContent = "";
            element.appendChild(animatedSpan);

            let visibleCount = 0;
            let scrambleOffset = 0;

            const startDelay = wordIndex * 20; // Stagger words

            setTimeout(() => {
              const interval = setInterval(() => {
                if (visibleCount < textLength) {
                  visibleCount++;
                } else if (scrambleOffset < scrambledLetterCount) {
                  scrambleOffset++;
                } else {
                  clearInterval(interval);
                  // Clean up: restore original text
                  element.style.position = "";
                  element.innerHTML = "";
                  element.textContent = originalText;
                  return;
                }

                // Calculate scrambled portion
                const remainingSpace = Math.max(0, textLength - visibleCount);
                const currentScrambleCount = Math.min(
                  remainingSpace,
                  scrambledLetterCount
                );

                const scrambledPart = Array(currentScrambleCount)
                  .fill(0)
                  .map(() => chars[Math.floor(Math.random() * chars.length)])
                  .join("");

                animatedSpan.textContent =
                  originalText.slice(0, visibleCount) + scrambledPart;
              }, scrambleSpeed);
            }, startDelay);
          });
        }
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
      <div className="col-span-2 border-[#282828] border flex flex-row gap-8 justify-between p-3 loader-box opacity-0">
        <div className="flex flex-col h-full justify-between text-white text-xs tracking-tight">
          {left.map((block, i) => (
            <ScrambleBlock key={i} lines={block} />
          ))}
        </div>
        <div className="flex flex-col justify-between w-[65%]">
          <JustifiedText
            className="text-[#5E5E5E] w-full opacity-0 text-xs tracking-tight"
            scramble
          >
            T1 2 3 4 5 6 7
          </JustifiedText>
          <JustifiedText
            className="text-[#5E5E5E] w-full opacity-0 text-xs tracking-tight"
            scramble
          >
            {rightText.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < rightText.length - 1 && <br />}
              </Fragment>
            ))}
          </JustifiedText>
          <JustifiedText
            className="text-[#5E5E5E] w-full opacity-0 text-xs tracking-tight"
            scramble
          >
            WIT BWIT FNOS SNOS <br /> Diagram By Pensatori Irrazionali
          </JustifiedText>
        </div>
      </div>
      <div className="col-span-1 border-[#282828] border flex flex-row gap-8 justify-between p-3 loader-box opacity-0">
        <div className="flex flex-col h-full justify-between text-white text-xs tracking-tight leading-[1.05]">
          {rightBox.map((block, i) => (
            <ScrambleBlock key={i} lines={block} />
          ))}
        </div>
        <div className="flex flex-col h-full justify-between text-white text-xs tracking-tight">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-row items-center gap-2 tabular-nums"
            >
              <ScrambleIn
                text={`${(index + 1)
                  .toString()
                  .padStart(2, "0")} STATUS / ACTIVE`}
                scrambleSpeed={30}
              />
              <div className="size-3 rounded-full bg-[#282828] loader-right-dot"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function renderCurvedList(items: string[], side: "left" | "right") {
  const len = items.length;
  return items.map((item, index) => {
    // Normalize position from -1 (top) to 1 (bottom)
    const normalizedPos = len > 1 ? (2 * index) / (len - 1) - 1 : 0;
    // Parabolic curve: 1 at center (normalizedPos=0), 0 at edges (normalizedPos=±1)
    const curveAmount = 1 - normalizedPos * normalizedPos;
    // Max offset percentage
    const maxOffset = 30;
    // For left side: curve outward to the left (negative X)
    // For right side: curve outward to the right (positive X)
    const translateAmount =
      side === "left" ? -curveAmount * maxOffset : curveAmount * maxOffset;

    return (
      <div
        style={{
          transform: `translateX(${translateAmount}%)`,
        }}
        className={`loader-list-item-${side} opacity-0 tracking-tight`}
        key={index}
      >
        {item}
      </div>
    );
  });
}

function LoaderCircleSVG({ mirrored = false }: { mirrored?: boolean }) {
  const id = mirrored ? "right" : "left";

  useIsomorphicLayoutEffect(() => {
    const tl = gsap.timeline({
      delay: 0.5,
    });

    tl.to(
      `.loader-draw-circle-cw-${id}`,
      {
        strokeDashoffset: 1229.5,
        duration: 1.5,
        ease: "power1.inOut",
      },
      0
    );
    tl.to(
      `.loader-draw-circle-ccw-${id}`,
      {
        strokeDashoffset: 1229.5,
        duration: 1.5,
        ease: "power1.inOut",
      },
      0
    );
    tl.to(
      `.loader-draw-line-${id}`,
      {
        strokeDashoffset: 0,
        duration: 1,
        ease: "power1.inOut",
      },
      0.3
    );

    return () => {
      tl.kill();
    };
  }, [id]);

  return (
    <div
      className={cn(
        "absolute h-full top-1/2 -translate-y-1/2 flex items-center loader-circle-svg",
        mirrored && "scale-x-[-1]"
      )}
      style={{
        // Position so the SVG circle's edge touches the main circle (92vh diameter = 46vh radius)
        ...(mirrored
          ? { left: "calc(50% + 46vh)" }
          : { right: "calc(50% + 46vh)" }),
      }}
    >
      <svg
        style={{ height: "92vh", width: "auto" }}
        viewBox="0 0 492 784"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle drawing clockwise (top half) */}
        <circle
          cx="100"
          cy="391.624"
          r="391.312"
          stroke="#282828"
          strokeWidth="0.623598"
          className={`loader-draw-circle-cw-${id}`}
          style={{
            strokeDasharray: 2459,
            strokeDashoffset: 2459,
          }}
        />
        {/* Circle drawing counter-clockwise (bottom half) */}
        <circle
          cx="100"
          cy="391.624"
          r="391.312"
          stroke="#282828"
          strokeWidth="0.623598"
          className={`loader-draw-circle-ccw-${id}`}
          style={{
            strokeDasharray: 2459,
            strokeDashoffset: 2459,
            transformOrigin: "100px 391.624px",
            transform: "scaleY(-1)",
          }}
        />
        <line
          x1="491"
          y1="378.124"
          x2="0"
          y2="378.124"
          stroke="#282828"
          className={`loader-draw-line-${id}`}
          style={{
            strokeDasharray: 491,
            strokeDashoffset: 491,
          }}
        />
        <line
          x1="491.13"
          y1="378.141"
          x2="-1.86977"
          y2="245.141"
          stroke="#282828"
          className={`loader-draw-line-${id}`}
          style={{
            strokeDasharray: 520,
            strokeDashoffset: 520,
          }}
        />
        <line
          x1="490.871"
          y1="378.141"
          x2="-1.12865"
          y2="509.141"
          stroke="#282828"
          className={`loader-draw-line-${id}`}
          style={{
            strokeDasharray: 520,
            strokeDashoffset: 520,
          }}
        />
      </svg>
    </div>
  );
}

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  const { navigateTo } = useNavigateTransition();
  const currentPath = usePathname();

  useIsomorphicLayoutEffect(() => {
    const loaderTl = gsap.timeline({
      onUpdate: () => {
        setProgress(Math.round(loaderTl.progress() * 100));
      },
      onComplete: () => {
        const closeTl = gsap.timeline({
          onComplete: () => {
            navigateTo(currentPath, true);
            gsap.set(".loader-wrapper", {
              delay: 0.6,
              opacity: 0,
              pointerEvents: "none",
            });
            ScrollTrigger.refresh();
            lenis?.start();
            onComplete?.();
          },
        });
        closeTl.to(
          ".loader-circle",
          {
            scale: 0,
            duration: 1.4,
            stagger: {
              each: 0.03,
              from: "end",
            },
          },
          0.25
        );
        closeTl.to(
          ".loader-circle-svg",
          {
            opacity: 0,
            duration: 1.4,
          },
          0.1
        );
        closeTl.to(
          ".loader-circle-secondary",
          {
            opacity: 0,
            duration: 0.6,
          },
          0
        );
        closeTl.to(
          ".loader-blind",
          {
            width: "100%",
            duration: 1.2,
            stagger: 0,
          },
          0.4
        );
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
      },
    });
    const rotateTween = gsap.to(".loader-rotate", {
      rotate: -360,
      duration: 40,
      repeat: -1,
      ease: "linear",
    });
    const flashingDotTween = gsap.to(
      ".loader-right-dot",

      {
        backgroundColor: "#51FD01",
        duration: 1.4,
        stagger: 0.09,
      }
    );
    loaderTl.to(".loader-circle", {
      scale: 1,
      duration: 1,
      stagger: 0.05,
    });
    loaderTl.to(
      ".loader-box",
      {
        opacity: 1,
        duration: 1,
        stagger: 0.05,
      },
      0
    );
    loaderTl.to(
      ".loader-circle-secondary",
      {
        opacity: 1,
        duration: 0.6,
        stagger: 0.02,
      },
      0.4
    );
    loaderTl.to(
      ".loader-list-item-left",
      {
        opacity: 1,
        duration: 1,
        stagger: 0.1,
      },
      0.4
    );
    loaderTl.to(
      ".loader-list-item-right",
      {
        opacity: 1,
        duration: 1,
        stagger: 0.1,
      },
      0.4
    );

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
      <LoaderCircleSVG />
      <LoaderCircleSVG mirrored />
      <div className="relative z-21 flex items-center gap-12 opacity-100 ">
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
                  "flex items-center justify-center overflow-hidden z-5 relative"
              )}
            >
              {i === 0 && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                  <div className="flex flex-col items-center text-[#434343] relative z-10">
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
                    <span className="font-helvetica-now text-[0.6vw] mb-2 absolute top-0 left-[84%] tracking-tight">
                      ({progress}%)
                    </span>
                  </div>
                  <div className="absolute left-8 flex flex-col gap-1 text-xs text-[#434343] font-helvetica-now text-left">
                    {renderCurvedList(LEFT_LIST, "left")}
                  </div>
                  <div className="absolute right-8 flex flex-col gap-1 text-xs text-[#434343] font-helvetica-now text-right">
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
