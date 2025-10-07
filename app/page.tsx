import HomeHero from "@/components/Home/home-hero";
import HomeProjects from "@/components/Home/home-projects";
import HomeProof from "@/components/Home/home-proof";
import { getProjects } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";

export default async function Home() {
  const client = getClient();
  const projects = await getProjects(client);

  return (
    <main>
      <HomeHero />
      <HomeProjects projects={projects} />
      <HomeProof />
      <div className="h-screen"></div>
    </main>
  );
}
