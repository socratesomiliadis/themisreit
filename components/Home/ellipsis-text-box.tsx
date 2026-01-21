"use client";

import Cross from "@/components/SVGs/cross";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface EllipsisTextBoxProps {
  index: string;
  lines: string[];
  highlight?: boolean;
  className?: string;
}

const EllipsisTextBox = forwardRef<HTMLDivElement, EllipsisTextBoxProps>(
  ({ index, lines, highlight = false, className }, ref) => {
    return (
      <div
        ref={ref}
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
        className={cn(
          "absolute flex flex-col gap-1 tracking-tight whitespace-nowrap",
          highlight ? "text-[#F669E4]" : "text-black",
          className
        )}
      >
        {/* <div className="flex items-center gap-1.5 mb-0.5">
          <Cross className="size-2" />
          <span className="text-[10px] opacity-60">{index}</span>
        </div> */}
        <div className="flex flex-col gap-0.5">
          {lines.map((line, i) => (
            <span key={i} className="leading-tight">
              {line}
            </span>
          ))}
        </div>
      </div>
    );
  }
);

EllipsisTextBox.displayName = "EllipsisTextBox";

export default EllipsisTextBox;
