import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const process = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/process' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    week: z.string(),
    description: z.string(),
    theme: z.enum(['sand', 'ink', 'accent', 'paper']),
    visual: z.enum(['wireframe', 'swatches', 'code', 'live']),
    swatches: z.array(z.string().regex(/^[0-9A-Fa-f]{6}$/)).optional(),
    liveDomain: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    const pic = z.object({ src: image(), alt: z.string() });
    return z.object({
      title: z.string(),
      sector: z.string(),
      year: z.number(),
      order: z.number(),
      kind: z.enum(['concepto', 'real']),
      draft: z.boolean().default(false),
      summary: z.string(),
      cover: image(),
      coverAlt: z.string(),
      url: z.url().optional(),
      before: pic,
      after: pic,
      blocks: z.array(z.object({ challenge: z.string(), solution: z.string() })).min(2).max(3),
      screens: z.object({ desktop: z.array(pic).min(1), mobile: z.array(pic).min(1) }),
    });
  },
});

export const collections = { process, projects };
