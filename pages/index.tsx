import HomeHero from "@/components/Home/home-hero";
import HomeProjects, { projectInfo } from "@/components/Home/home-projects";
import HomeProof from "@/components/Home/home-proof";

export default function Home() {
  return (
    <>
      <main>
        <HomeHero />
        <HomeProjects />
        <HomeProof />
        <div className="h-screen"></div>
      </main>
    </>
  );
}
