import ProjectHero from "@/components/ProjectSingle/project-hero";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { getProject, projectSlugsQuery } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import { ProjectBySlugQueryResult } from "@/sanity.types";
import { useLenis } from "lenis/react";
import Head from "next/head";
import { useLayoutEffect } from "react";

export default function ProjectPage({
  project,
}: {
  project: ProjectBySlugQueryResult;
}) {
  const lenis = useLenis();
  useLayoutEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });
    lenis?.start();
  }, [lenis]);

  if (!project) return null;
  return (
    <>
      <Head>
        <title>Themis Reit — {project.title}</title>
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
          content={urlForImage(project.mainImage)?.url() ?? ""}
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
        <ProjectHero projectData={project} />
      </main>
    </>
  );
}

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const client = getClient();
  const project = await getProject(client, params.slug);

  if (!project) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project,
    },
  };
};

export const getStaticPaths = async () => {
  const client = getClient();
  const slugs = await client.fetch(projectSlugsQuery);

  return {
    paths: slugs?.map(({ slug }: { slug: string }) => `/work/${slug}`) || [],
    fallback: "blocking",
  };
};
