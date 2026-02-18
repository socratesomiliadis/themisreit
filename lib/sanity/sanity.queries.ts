import { SanityClient } from "next-sanity";
import { groq } from "next-sanity";

export const projectsQuery = groq`*[_type == "project" && defined(slug.current)]{
  ...,
  category->
} | order(orderRank)`;

export async function getProjects(client: SanityClient): Promise<any[]> {
  return await client.fetch(projectsQuery);
}

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug]{
  ...,
  category->
}[0]`;

export async function getProject(
  client: SanityClient,
  slug: string
): Promise<any> {
  return await client.fetch(projectBySlugQuery, { slug });
}

export const projectSlugsQuery = groq`
*[_type == "project" && defined(slug.current)][].slug.current
`;

export const categoriesQuery = groq`
  *[_type == "category"] | order(lower(title))
`;

export async function getCategories(client: SanityClient): Promise<any[]> {
  return await client.fetch(categoriesQuery);
}

export const servicesQuery = groq`*[_type == "service"]{
  ...
} | order(orderRank)`;

export async function getServices(client: SanityClient): Promise<any[]> {
  return await client.fetch(servicesQuery);
}

// Get the next project based on orderRank, wrapping to first if current is last
// Uses GROQ parent reference (^) to efficiently fetch only 2 projects max
export const nextProjectQuery = groq`*[_type == "project" && slug.current == $slug][0] {
  _id,
  orderRank,
  "nextProject": *[_type == "project" && defined(slug.current) && orderRank > ^.orderRank] | order(orderRank) [0] {
    ...,
    category->
  },
  "firstProject": *[_type == "project" && defined(slug.current)] | order(orderRank) [0] {
    ...,
    category->
  }
}`;

export async function getNextProject(
  client: SanityClient,
  slug: string
): Promise<any | null> {
  const result = await client.fetch(nextProjectQuery, { slug });

  if (!result) {
    return null;
  }

  // Return next project if exists, otherwise wrap to first
  // Also ensure we don't return the current project as "next"
  if (result.nextProject) {
    return result.nextProject;
  }

  // Wrap around to first project (only if it's not the current one)
  if (result.firstProject && result.firstProject._id !== result._id) {
    return result.firstProject;
  }

  return null;
}

export const clientsQuery = groq`*[_type == "client"]{
  ...
} | order(orderRank)`;

export async function getClients(client: SanityClient): Promise<any[]> {
  return await client.fetch(clientsQuery);
}
