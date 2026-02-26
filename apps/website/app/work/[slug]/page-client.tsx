"use client";

import ProjectHero from "@/components/ProjectSingle/project-hero";
import ProjectAbout from "@/components/ProjectSingle/project-about";
import ProjectStories from "@/components/ProjectSingle/project-stories";
import {
  NextProjectQueryResult,
  ProjectBySlugQueryResult,
} from "@/sanity.types";
import { useLenis } from "lenis/react";
import { useLayoutEffect } from "react";
import ProjectNext from "@/components/ProjectSingle/project-next";
import ProjectGallery from "@/components/ProjectSingle/project-gallery";
import ProjectFrames from "@/components/ProjectSingle/project-frames";
import ProjectInfo from "@/components/ProjectSingle/project-info";

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
      <ProjectAbout projectData={project} />
      <ProjectStories projectData={project} />
      <ProjectGallery projectData={project} />
      <ProjectFrames projectData={project} />
      <ProjectInfo projectData={project} />
      <ProjectNext nextProject={nextProject} />
    </main>
  );
}
