import HomeHero from "@/components/Home/home-hero";
import HomeProjects, { projectInfo } from "@/components/Home/home-projects";

export default function Home() {
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
