import { defineCollection, z } from "astro:content";

const staffCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    clubRole: z.string().optional(), // Role within the club administration, e.g. "Président", "Trésorier"
    image: z.string().startsWith("/uploads/").optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(), // Short bio in frontmatter
    order: z.number().default(0),
  }),
});

const eventsCollection = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      startDate: z.date(),
      endDate: z.date().optional(),
      time: z.string().optional(),
      location: z.string(),
      image: z.string().startsWith("/uploads/"),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
      registrationLink: z.string().url().optional(),
      draft: z.boolean().default(false),
    })
    .refine(
      ({ startDate, endDate }) => !endDate || endDate >= startDate,
      {
        message: "endDate must be on or after startDate",
        path: ["endDate"],
      },
    ),
});

const disciplinesCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    logo: z.string().startsWith("/uploads/").optional(),
    summary: z.string(),
    coordinator: z.string(),
    enseignantsReferents: z.array(z.string()).optional(),
    enseignantsAssistants: z.array(z.string()).optional(),
    contact: z.string().optional(), // Email or text
    websiteLink: z.string().url().optional(),
    facebookLink: z.string().url().optional(),
    instagramLink: z.string().url().optional(),
    youtubeLink: z.string().url().optional(),
    schedule: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

const articlesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string().optional(),
    author: z.string().default("Équipe du Club Lillois de Judo Kendo"),
    image: z
      .union([
        z.string().startsWith("/uploads/"),
        z.object({
          url: z.string().startsWith("/uploads/"),
          alt: z.string(),
        }),
      ])
      .optional(),
    tags: z.array(z.string()).default(["general"]),
    draft: z.boolean().default(false),
  }),
});

const pagesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  staff: staffCollection,
  events: eventsCollection,
  disciplines: disciplinesCollection,
  articles: articlesCollection,
  pages: pagesCollection,
};
