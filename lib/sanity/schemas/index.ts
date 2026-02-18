import { SchemaTypeDefinition } from "sanity";

import project from "./project";
import category from "./category";
import service from "./service";
import collage from "./collage";
import client from "./client";

export const schemaTypes = [project, category, service, collage, client];
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, category, service, collage, client],
};
