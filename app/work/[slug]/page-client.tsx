"use client";

import ProjectHero from "@/components/ProjectSingle/project-hero";
import {
  NextProjectQueryResult,
  ProjectBySlugQueryResult,
} from "@/sanity.types";
import { useLenis } from "lenis/react";
import { useLayoutEffect } from "react";
import ProjectNext from "@/components/ProjectSingle/project-next";

interface NextProject {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  category: any;
}

export default function ProjectPageClient({
  project,
  nextProject,
}: {
  project: ProjectBySlugQueryResult;
  nextProject: ProjectBySlugQueryResult;
}) {
  const lenis = useLenis();

  useLayoutEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });
    lenis?.start();
  }, [lenis]);

  return (
    <main>
      <ProjectHero projectData={project} />
      <div className="w-full h-[200vh]"></div>
      <ProjectNext nextProject={nextProject} />
    </main>
  );
}
