import { getProjects } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import ProjectsSliderNew from "@/components/projects-slider-new";

export default async function WorkPage() {
  const client = getClient();
  const projects = await getProjects(client);

  return (
    <div className="w-fit relative z-10">
      <ProjectsSliderNew projects={projects} />
    </div>
  );
}
