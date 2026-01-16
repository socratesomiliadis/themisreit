import { SchemaTypeDefinition } from "sanity";

import project from "./project";
import category from "./category";
import service from "./service";

export const schemaTypes = [project, category, service];
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, category, service],
};
