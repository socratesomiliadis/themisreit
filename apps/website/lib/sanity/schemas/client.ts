import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";

export default defineType({
  name: "client",
  title: "Client",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "client" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "title",
      media: "logo",
    },
  },
});
