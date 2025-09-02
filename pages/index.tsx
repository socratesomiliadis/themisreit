import HomeHero from "@/components/Home/home-hero";
import HomeProjects, { projectInfo } from "@/components/Home/home-projects";
import InteractiveShaderBackground from "@/components/InteractiveShaderBackground";
import GooeyBg from "@/components/GooeyBg";

export default function Home() {
  return (
    <>
      <main>
        <HomeHero />
        <HomeProjects />
        <div className="home-test w-screen h-screen p-64 relative">
          <GooeyBg
            className="absolute inset-0 z-0"
            particleSize={0.11}
            maskIntensity={2.5}
            backgroundColor="#000000"
            particleColor="#ededed"
            brushSize={80}
            brushStrength={0.8}
          />
          <div className="relative z-10 flex items-center justify-center text-white text-2xl">
            Move your mouse to reveal the particles
          </div>
        </div>
      </main>
    </>
  );
}
