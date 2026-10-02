import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://anandakevin.github.io',
  output: 'static',
  integrations: [sitemap()],
  env: {
    schema: {
      PUBLIC_CONTENT_MODE: envField.enum({
        context: 'client',
        access: 'public',
        optional: true,
        values: ['preview', 'publish', 'production', 'fixtures'],
      }),
    },
  },
});
