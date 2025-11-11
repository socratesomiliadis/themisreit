import { cn } from "@/lib/utils";
import { ProjectsQueryResult } from "@/sanity.types";

export default function MinimapScrollbar({
  projects,
  activeIndex,
}: {
  projects: ProjectsQueryResult;
  activeIndex: number;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="flex flex-row items-center gap-1">
        {projects.map((project, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-auto aspect-11/16 border border-white/50 transition-[width,border-color] duration-300 ease-out",
              index === activeIndex && "w-5 border-white",
              Math.abs(index - activeIndex) === 1 && "w-4"
            )}
          ></div>
        ))}
      </div>
    </div>
  );
}
