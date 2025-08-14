import HomeHero from "@/components/Home/home-hero";
import HomeProjects, { projectInfo } from "@/components/Home/home-projects";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";

export default function Home() {
  const router = useRouter();
  const lenis = useLenis();
  const { project } = router.query;
  const projectData = projectInfo.find((p: any) => p.slug === project);

  useEffect(() => {
    const tl = gsap.timeline();
    if (project) {
      const allElements = gsap.utils.toArray(
        `.home-projects > * > *:not(.project-item-${project})`
      );

      tl.to([".home-hero", ".home-test", ...allElements], {
        opacity: 0,
        stagger: 0.05,
      });
      tl.add(() => {
        lenis?.scrollTo(0);
      }, 0);
      tl.to(
        ".home-hero",
        {
          height: 0,
          duration: 1.2,
        },
        0.1
      );
    }

    return () => {
      tl.revert();
    };
  }, [project]);

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
