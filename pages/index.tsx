import HomeHero from "@/components/Home/home-hero";
import HomeProjects, { projectInfo } from "@/components/Home/home-projects";
import InteractiveShaderBackground from "@/components/InteractiveShaderBackground";

export default function Home() {
  return (
    <>
      <main>
        <HomeHero />
        <HomeProjects />
        <div className="home-test w-screen h-screen p-64">
          <div className="w-full h-full bg-red-400 relative">
            <InteractiveShaderBackground
              className="absolute inset-0"
              config={{
                color1: "#b8fff7",
                color2: "#6e3466",
                color3: "#0133ff",
                color4: "#66d1fe",
                brushSize: 30,
                distortionAmount: 2.0,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
