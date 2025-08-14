import { projectInfo } from "@/components/Home/home-projects";
import ProjectHero from "@/components/ProjectSingle/project-hero";
import { useLenis } from "lenis/react";
import { useRouter } from "next/router";
import { useLayoutEffect } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const { slug } = router.query;
  const lenis = useLenis();
  useLayoutEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
    });
  }, [lenis]);

  return (
    <main>
      <ProjectHero
        projectData={projectInfo.find((p: any) => p.slug === slug)}
      />
    </main>
  );
}
