import { z } from 'astro/zod';
import raw from '../content/site.json';

const seg = z.object({ t: z.string(), acc: z.boolean().optional() });
const lines = z.array(z.array(seg)).min(1);

export const siteSchema = z.object({
  name: z.string(),
  brand: z.string(),
  url: z.url(),
  description: z.string(),
  location: z.string(),
  region: z.string(),
  areaServed: z.array(z.string()),
  whatsapp: z.object({ number: z.string().regex(/^\d{9,15}$/), message: z.string() }),
  email: z.email(),
  instagram: z.object({ handle: z.string(), url: z.url() }),
  hero: z.object({
    h1: z.string(), lines, label: z.string(), tagline: z.string(),
    hintPointer: z.string(), hintTouch: z.string(), cta: z.string(),
  }),
  statement: z.string(),
  contact: z.object({ h2: z.string(), lines, label: z.string(), note: z.string(), button: z.string() }),
});

export type Site = z.infer<typeof siteSchema>;
export type Lines = z.infer<typeof lines>;
export const site: Site = siteSchema.parse(raw);

export const whatsappUrl = `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message)}`;
