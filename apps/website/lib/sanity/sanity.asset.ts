import { getFile, SanityFileSource } from "@sanity/asset-utils";

import { dataset, projectId } from "@/lib/sanity/sanity.api";

/**
 * Builds a URL for a Sanity file asset (video, PDF, etc.)
 */
export const urlForAsset = (source: SanityFileSource): string | undefined => {
  if (!source) {
    return undefined;
  }

  try {
    const file = getFile(source, {
      projectId: projectId || "",
      dataset: dataset || "",
    });

    return file.asset.url;
  } catch {
    return undefined;
  }
};
