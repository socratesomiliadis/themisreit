import HomeHero from "@/components/Home/home-hero";
import HomeProjects, { projectInfo } from "@/components/Home/home-projects";
import ProjectHero from "@/components/ProjectSingle/project-hero";
import { useRouter } from "next/router";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { useLenis } from "lenis/react";

export default function Home() {
  const router = useRouter();
  const lenis = useLenis();
  const { project } = router.query;
  const projectData = projectInfo.find((p: any) => p.slug === project);

  return (
    <>
      <main>
        <HomeHero />
        <HomeProjects />
        <div className="home-test w-screen h-screen p-64">
          <div className="w-full h-full bg-red-400"></div>
        </div>
      </main>
    </>
  );
}
