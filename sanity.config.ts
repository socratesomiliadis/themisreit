/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

// see https://www.sanity.io/docs/api-versioning for how versioning works
import { dataset, projectId } from "@/lib/sanity/sanity.api";
import { schema } from "@/lib/sanity/schemas";

import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export default defineConfig({
  basePath: "/sanity",
  name: "themisreit",
  title: "Themisreit",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({
      structure: (S, context) => {
        return S.list()
          .title("Content")
          .items([
            // Minimum required configuration
            orderableDocumentListDeskItem({ type: "project", S, context }),

            // ... all other desk items
          ]);
      },
    }),
  ],
});
