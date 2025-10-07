"use client";

import ProjectHero from "@/components/ProjectSingle/project-hero";
import { ProjectBySlugQueryResult } from "@/sanity.types";
import { useLenis } from "lenis/react";
import { useLayoutEffect } from "react";

export default function ProjectPageClient({
  project,
}: {
  project: ProjectBySlugQueryResult;
}) {
  const lenis = useLenis();

  useLayoutEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });
    lenis?.start();
  }, [lenis]);

  return <ProjectHero projectData={project} />;
}
