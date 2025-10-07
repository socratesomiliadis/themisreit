import { SchemaTypeDefinition } from "sanity";

import project from "./project";
import category from "./category";

export const schemaTypes = [project, category];
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, category],
};
