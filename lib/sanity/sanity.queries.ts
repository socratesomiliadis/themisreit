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
