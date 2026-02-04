"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import TitleAndDesc from "../title-and-desc";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { randomFloatFromInterval } from "@/lib/utils";

const CYCLE_DURATION = 5; // Time each logo is visible
const TRANSITION_DURATION = 0.8; // Duration of fade/blur transition

// Aspect ratio threshold: below this is considered "square-ish"
const SQUARE_THRESHOLD = 1.5;

function LogoImage({
  src,
  onAspectRatio,
}: {
  src: string;
  onAspectRatio: (isSquare: boolean) => void;
}) {
  return (
    <Image
      src={src}
      alt="Logo"
      width={200}
      height={200}
      className="w-full h-full object-contain"
      onLoad={(e) => {
        const img = e.currentTarget;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        onAspectRatio(aspectRatio < SQUARE_THRESHOLD);
      }}
    />
  );
}

function ProofBox({
  logoSRCs,
  startDelay,
}: {
  logoSRCs: string[];
  startDelay: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndexRef = useRef(0);
  const [aspectRatios, setAspectRatios] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const logos = logosRef.current.filter(Boolean) as HTMLDivElement[];
    if (logos.length === 0) return;

    // Use GSAP context for proper cleanup on hot reload
    const ctx = gsap.context(() => {
      // Reset index on effect re-run
      currentIndexRef.current = 0;

      // Set initial state: all logos hidden with blur
      gsap.set(logos, {
        opacity: 0,
        filter: "blur(12px)",
        scale: 0.9,
      });

      // Show first logo
      gsap.set(logos[0], {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
      });

      const cycleLogos = () => {
        const currentLogo = logos[currentIndexRef.current];
        const nextIndex = (currentIndexRef.current + 1) % logos.length;
        const nextLogo = logos[nextIndex];

        // Create timeline for smooth transition
        const tl = gsap.timeline();

        // Fade out current logo with blur
        tl.to(
          currentLogo,
          {
            opacity: 0,
            filter: "blur(12px)",
            duration: TRANSITION_DURATION,
            ease: "power2.inOut",
            scale: 0.9,
          },
          0
        );

        // Fade in next logo with blur removal
        tl.fromTo(
          nextLogo,
          {
            opacity: 0,
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: TRANSITION_DURATION,
            ease: "power2.inOut",
            scale: 1,
          },
          0
        );

        currentIndexRef.current = nextIndex;
      };

      // Start the cycle after the random delay
      gsap.delayedCall(startDelay, () => {
        // Set up repeating interval
        gsap.delayedCall(CYCLE_DURATION, function repeat() {
          cycleLogos();
          gsap.delayedCall(CYCLE_DURATION, repeat);
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [logoSRCs.length, startDelay]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col relative border border-[#303030]/10 aspect-video items-center justify-center"
    >
      {logoSRCs.map((logoSRC, index) => {
        const isSquare = aspectRatios[index] ?? false;
        return (
          <div
            key={logoSRC}
            ref={(el) => {
              logosRef.current[index] = el;
            }}
            className="absolute flex items-center justify-center transition-[width,height] duration-300"
            style={{
              width: isSquare ? "50%" : "40%",
              height: isSquare ? "30%" : "25%",
            }}
          >
            <LogoImage
              src={logoSRC}
              onAspectRatio={(isSquare) =>
                setAspectRatios((prev) => ({ ...prev, [index]: isSquare }))
              }
            />
          </div>
        );
      })}
    </div>
  );
}

const TOTAL_LOGOS = 50;
const TOTAL_BOXES = 10;
const LOGOS_PER_BOX = TOTAL_LOGOS / TOTAL_BOXES;

// Pre-generate stable random delays (won't change on hot reload)
const generateBoxData = () =>
  Array.from({ length: TOTAL_BOXES }).map((_, index) => ({
    logoSRCs: Array.from(
      { length: LOGOS_PER_BOX },
      (_, i) => `/static/images/logos/${index * LOGOS_PER_BOX + i}.png`
    ),
    startDelay: randomFloatFromInterval(0, CYCLE_DURATION / 2),
  }));

export default function HomeProof() {
  // Memoize box data so random delays stay stable across re-renders
  const boxData = useMemo(() => generateBoxData(), []);

  return (
    <section className="w-screen flex flex-col relative z-10 px-12">
      <TitleAndDesc
        delay={1.2}
        wrapperClassName="z-20"
        title="About it"
        desc={
          <>
            We don't do generic design. Our creative solutions <br />
            make brands stand out, improve user experience, <br />
            and boost revenue.
          </>
        }
      />
      <div className="w-full grid grid-cols-5 gap-6 mt-12">
        {boxData.map((box, index) => (
          <ProofBox
            key={index}
            logoSRCs={box.logoSRCs}
            startDelay={box.startDelay}
          />
        ))}
      </div>
    </section>
  );
}
