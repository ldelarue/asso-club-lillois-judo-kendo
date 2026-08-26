import { z } from "astro:content";
import rawConfig from "../_data/conf.json";

const linkUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/(?!\/)/, "Expected an absolute URL or root-relative path"),
]);

const linkSchema = z.object({
  label: z.string().trim().min(1),
  url: linkUrlSchema,
});

const siteConfigSchema = z.object({
  home: z.object({
    schedules: z
      .array(
        z.object({
          section: z.string().trim().min(1),
          content: z.string().trim().min(1),
          comment: z.string().trim().min(1).optional(),
        }),
      )
      .min(1),
    "maps-url": z.string().url(),
    "maps-integration-source": z.string().url(),
    "access-info": z.string().optional(),
  }),
  tarifs: z
    .array(
      z.object({
        discipline: z.string().trim().min(1),
        ageBands: z
          .array(
            z.object({
              label: z.string().trim().min(1),
              cotisationClub: z.number().nonnegative(),
              licenceAssurance: z.number().nonnegative(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
  footer: z.object({
    addresses: z.object({
      dojo: z.string().trim().min(1),
      headquarters: z.string().trim().min(1).optional(),
    }),
    "other-websites": z.array(linkSchema),
    links: z.array(linkSchema),
    "facebook-link": z.string().url(),
  }),
});

export default siteConfigSchema.parse(rawConfig);