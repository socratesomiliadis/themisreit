import { defineArrayMember, defineField, defineType } from "sanity";
import type { ReactNode } from "react";
import { CollageInput } from "@/lib/sanity/components/collage-input";

export default defineType({
  name: "collage",
  title: "Collage",
  type: "object",
  components: {
    input: CollageInput,
  },
  fields: [
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        defineArrayMember({
          name: "item",
          title: "Item",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "x",
              title: "X",
              type: "number",
              initialValue: 10,
            }),
            defineField({
              name: "y",
              title: "Y",
              type: "number",
              initialValue: 10,
            }),
            defineField({
              name: "width",
              title: "Width",
              type: "number",
              initialValue: 22,
            }),
            defineField({
              name: "height",
              title: "Height",
              type: "number",
              initialValue: 22,
            }),
            defineField({
              name: "zIndex",
              title: "Z-Index",
              type: "number",
              initialValue: 1,
            }),
          ],
          preview: {
            select: {
              media: "image",
              x: "x",
              y: "y",
            },
            prepare(selection) {
              const { x, y, media } = selection as {
                x?: number;
                y?: number;
                media?: ReactNode;
              };
              return {
                title: `Item (${Math.round(x ?? 0)}%, ${Math.round(y ?? 0)}%)`,
                media,
              };
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
});
