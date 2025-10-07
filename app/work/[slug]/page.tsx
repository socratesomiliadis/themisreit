import ProjectHero from "@/components/ProjectSingle/project-hero";
import { urlForImage } from "@/lib/sanity/sanity.image";
import { getProject, projectSlugsQuery } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import { ProjectBySlugQueryResult } from "@/sanity.types";
import { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import ProjectPageClient from "./page-client";

export async function generateStaticParams() {
  const client = getClient();
  const slugs = await client.fetch(projectSlugsQuery);

  return (
    slugs?.map((slug: string) => ({
      slug,
    })) || []
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const client = getClient();
  const project = await getProject(client, slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `Themis Reit — ${project.title}`,
    description:
      "We help visionary brands flourish by crafting digital experiences that let audiences feel the depth, elegance, and essence of their products.",
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: `Themis Reit — ${project.title}`,
      type: "website",
      description:
        "We help visionary brands flourish by crafting digital experiences that let audiences feel the depth, elegance, and essence of their products.",
      images: [
        {
          url: urlForImage(project.mainImage)?.url() ?? "",
          width: 1600,
          height: 900,
          alt: "Themis Reit",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#E1FF00",
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getClient();
  const project = await getProject(client, slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
      <ProjectPageClient project={project} />
    </main>
  );
}
