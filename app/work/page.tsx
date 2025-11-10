import ProjectsSlider from "@/components/projects-slider";
import { getProjects } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";

export default async function WorkPage() {
  const client = getClient();
  const projects = await getProjects(client);
  return (
    <div>
      <div className="w-screen h-screen">
        <ProjectsSlider projects={projects} />
      </div>
    </div>
  );
}
