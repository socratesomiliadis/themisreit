import HomeHero from "@/components/Home/home-hero";
import HomeProjects from "@/components/Home/home-projects";
import HomeQuote from "@/components/Home/home-quote";
import HomeProof from "@/components/Home/home-proof";
import HomeShowcase from "@/components/Home/home-showcase";
import HomeCta from "@/components/Home/home-cta";
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
      <HomeShowcase />
      <HomeQuote />
      <HomeCta />
      <div className="h-screen"></div>
    </main>
  );
}
