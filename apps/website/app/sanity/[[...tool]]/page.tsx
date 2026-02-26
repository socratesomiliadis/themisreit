import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return (
    <div data-lenis-prevent>
      <NextStudio config={config} />
    </div>
  );
}
