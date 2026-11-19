// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rgdev.studio',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({ filter: (page) => !page.includes('/lab') }),
  ],
});
