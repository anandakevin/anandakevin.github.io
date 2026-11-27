import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://anandakevin.github.io',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    build: {
      // Excalidraw and Mermaid are intentionally lazy-loaded visualization
      // dependencies. Keep a guard for unexpected growth while allowing the
      // measured vendor chunk to remain just under 2 MB.
      chunkSizeWarningLimit: 2048,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            /node_modules\/(?:@radix-ui|jotai)\//.test(warning.id ?? '')
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
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
