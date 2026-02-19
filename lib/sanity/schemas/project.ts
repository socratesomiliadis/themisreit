import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      validation: (Rule) => Rule.required(),
      options: {
        source: "title",
        maxLength: 96,
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "projectOrigin",
      title: "Project Origin",
      type: "object",
      fields: [
        defineField({
          name: "type",
          title: "Type",
          type: "string",
          options: {
            list: ["Commission", "Concept"],
            layout: "radio",
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "subbrand",
          title: "Subbrand",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brandColor",
      title: "Brand Color",
      type: "string",
      validation: (Rule) => Rule.required().regex(/^#([0-9a-fA-F]{6})$/),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "collage",
      title: "Collage",
      type: "collage",
    }),

    defineField({
      name: "stories",
      title: "Stories",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              description:
                "Upload an image (use either image or video, not both)",
            }),
            defineField({
              name: "video",
              title: "Video",
              type: "file",
              options: {
                accept: "video/*",
              },
              description:
                "Upload a video (use either image or video, not both)",
            }),
          ],
          validation: (Rule) =>
            Rule.custom(
              (fields: { image?: unknown; video?: unknown } | undefined) => {
                const hasImage = !!fields?.image;
                const hasVideo = !!fields?.video;
                if (!hasImage && !hasVideo) {
                  return "Either an image or a video is required";
                }
                if (hasImage && hasVideo) {
                  return "Please provide either an image or a video, not both";
                }
                return true;
              }
            ),
        },
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "galleryDescription",
      title: "Gallery Description",
      type: "text",
    }),
    defineField({
      name: "frames",
      title: "Frames",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "projectInfo",
      title: "Project Info",
      type: "object",
      fields: [
        defineField({
          name: "numOfPeople",
          title: "Number of People",
          type: "number",
        }),
        defineField({
          name: "numOfHours",
          title: "Number of Hours",
          type: "number",
        }),
        defineField({
          name: "location",
          title: "Location",
          type: "string",
        }),
        defineField({
          name: "director",
          title: "Director",
          type: "string",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "company",
      media: "logo",
    },
  },
});
