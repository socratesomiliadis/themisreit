import { getProjects } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import InfiniteGallery from "@/components/universe/infinite-gallery";

export default async function UniversePage() {
  const client = getClient();
  const projects = await getProjects(client);

  return (
    <div className="fixed inset-0">
      <InfiniteGallery projects={projects} />
    </div>
  );
}
