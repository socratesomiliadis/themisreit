import HomeHero from "@/components/Home/home-hero";
import HomeProjects from "@/components/Home/home-projects";
import HomeProof from "@/components/Home/home-proof";
import { getProjects } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import { ProjectsQueryResult } from "@/sanity.types";
import { GetStaticProps } from "next";
import Head from "next/head";

export default function Home({ projects }: { projects: ProjectsQueryResult }) {
  return (
    <>
      <Head>
        <title>Themis Reit — Home</title>
        <meta
          name="description"
          content="We help visionary brands flourish
by crafting digital experiences that let 
audiences feel the depth, elegance, and 
essence of their products."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Themis Reit" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="We help visionary brands flourish
by crafting digital experiences that let 
audiences feel the depth, elegance, and 
essence of their products."
        />
        <meta
          property="og:image"
          content="https://themisreit.vercel.app/ogImage.png"
        />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="900" />
        <meta property="og:image:alt" content="Themis Reit" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#E1FF00" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>

      <main>
        <HomeHero />
        <HomeProjects projects={projects} />
        <HomeProof />
        <div className="h-screen"></div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const client = getClient();
  const projects = await getProjects(client);

  return {
    props: {
      projects,
    },
  };
};
