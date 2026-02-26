"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import EllipsisTextBox from "./ellipsis-text-box";
import SimpleMarquee from "../simple-marquee";
import TitleMarquee from "../title-marquee";

interface TextBoxData {
  index: string;
  lines: string[];
  highlight?: boolean;
  // Initial angle on the ellipse (in degrees)
  startAngle: number;
}

const textBoxes: TextBoxData[] = [
  {
    index: "-01",
    lines: [
      "Seamless execution",
      "Transparent teamwork",
      "World-class creative",
    ],
    startAngle: 0,
  },
  {
    index: "-02",
    lines: ["Tech-forward evolution", "Modular frameworks", "Good times!"],
    highlight: true,
    startAngle: 30,
  },
  {
    index: "-03",
    lines: ["Global partnerships", "Better efficiency"],
    startAngle: 60,
  },
  {
    index: "-04",
    lines: ["Unified direction", "Brand love"],
    startAngle: 90,
  },
  {
    index: "-05",
    lines: ["Stakeholder buy-in", "Industry admiration"],
    startAngle: 120,
  },
  {
    index: "-06",
    lines: [
      "Web design & development",
      "Interactive WebGL experiences",
      "E-commerce stores",
    ],
    startAngle: 150,
  },
  {
    index: "-07",
    lines: ["Virtual environment design", "Multiplayer social spaces"],
    startAngle: 180,
  },
  {
    index: "-08",
    lines: ["3D level design", "Reward & collectible mechanics"],
    startAngle: 210,
  },
  {
    index: "-09",
    lines: [
      "Brand systems & tone of voice",
      "Product packaging",
      "Motion identities",
    ],
    startAngle: 240,
  },
  {
    index: "-10",
    lines: [
      "Cinematic video production",
      "Motion graphics & VFX",
      "Product films & brand stories",
      "Content strategy & social campaigns",
    ],
    startAngle: 270,
  },
  {
    index: "-11",
    lines: ["AR filters", "Product try-ons & visualizers"],
    startAngle: 300,
  },
  {
    index: "",
    lines: ["Sometimes we're up until", "the sun rises"],
    highlight: true,
    startAngle: 330,
  },
];

export default function HomeEllipsisText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anglesRef = useRef<number[]>(textBoxes.map((box) => box.startAngle));
  // Cache box dimensions to avoid layout thrashing
  const boxDimensionsRef = useRef<{ width: number; height: number }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Speed of rotation (degrees per frame)
    const rotationSpeed = 0.015;

    // Ellipse tilt angle (in degrees) - rotates the entire ellipse shape
    const ellipseTilt = -10 * (Math.PI / 180);

    // Cache box dimensions once
    const cacheBoxDimensions = () => {
      boxDimensionsRef.current = boxRefs.current.map((box) => ({
        width: box?.offsetWidth ?? 0,
        height: box?.offsetHeight ?? 0,
      }));
    };

    // Get ellipse parameters
    const getEllipseParams = () => {
      return {
        radiusX: container.offsetWidth * 0.42,
        radiusY: container.offsetHeight * 0.38,
        centerX: container.offsetWidth / 2,
        centerY: container.offsetHeight / 2,
      };
    };

    // Position each box on the ellipse
    const updatePositions = () => {
      const { radiusX, radiusY, centerX, centerY } = getEllipseParams();

      boxRefs.current.forEach((box, i) => {
        if (!box) return;
        const angle = anglesRef.current[i] * (Math.PI / 180);
        const dims = boxDimensionsRef.current[i] || { width: 0, height: 0 };

        // Calculate position on un-rotated ellipse
        const ellipseX = radiusX * Math.cos(angle);
        const ellipseY = radiusY * Math.sin(angle);

        // Rotate the point by the ellipse tilt angle
        const rotatedX =
          ellipseX * Math.cos(ellipseTilt) - ellipseY * Math.sin(ellipseTilt);
        const rotatedY =
          ellipseX * Math.sin(ellipseTilt) + ellipseY * Math.cos(ellipseTilt);

        // Translate to center (use cached dimensions)
        const x = centerX + rotatedX - dims.width / 2;
        const y = centerY + rotatedY - dims.height / 2;

        // Use translate3d for GPU acceleration
        box.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    // Cache dimensions and set initial positions
    cacheBoxDimensions();
    updatePositions();

    // Animation tick function
    const tick = () => {
      // Update all angles
      anglesRef.current = anglesRef.current.map((angle) => {
        const newAngle = angle + rotationSpeed;
        return newAngle >= 360 ? newAngle - 360 : newAngle;
      });
      updatePositions();
    };

    // Add to GSAP ticker for smooth animation
    gsap.ticker.add(tick);

    // Handle resize - recache dimensions
    const handleResize = () => {
      cacheBoxDimensions();
      updatePositions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="w-screen relative z-10 flex flex-col pt-32 pb-64 gap-32">
      <TitleMarquee title="Disciplines" number={2} />
      <div ref={containerRef} className="relative w-screen h-[65vh]">
        {textBoxes.map((box, i) => (
          <EllipsisTextBox
            key={i}
            ref={(el) => {
              boxRefs.current[i] = el;
            }}
            index={box.index}
            lines={box.lines}
            highlight={box.highlight}
          />
        ))}
      </div>
    </section>
  );
}
