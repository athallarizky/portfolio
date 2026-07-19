// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // sprint-13: stable origin for canonical URLs + sitemap (was request-derived).
  site: 'https://athallarizky.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte(), sitemap()],
});
