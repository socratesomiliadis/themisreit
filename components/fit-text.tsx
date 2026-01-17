"use client";

import { useFitText } from "react-use-fittext";
import { cn } from "@/lib/utils";

export default function FitText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { containerRef, textRef, fontSize } = useFitText({
    debounceDelay: 50, // Faster response
    resolution: 1, // Higher precision
    fitMode: "width",
    maxFontSize: 1000,
    lineMode: "single",
  });

  return (
    <span aria-hidden="true" className={cn("text-fit w-full", className)}>
      <span>
        <span className="text-fit">
          <span>
            <span>{text}</span>
          </span>
          <span aria-hidden="true">{text}</span>
        </span>
      </span>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
