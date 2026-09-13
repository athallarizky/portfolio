// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Sprint-25: hreflang alternates for the bilingual content routes (en ↔ id, x-default → en).
// Injected via serialize — the /id/ zone is a plain route subtree, not Astro i18n routing.
// Keys carry the trailing slash: `directory` build format emits /blogs/ URLs in the sitemap.
const SITE = 'https://athallarizky.com';
const HREFLANG_PAIRS = new Map([
  [`${SITE}/blogs/`, [`${SITE}/blogs/`, `${SITE}/id/blogs/`]],
  [`${SITE}/projects/`, [`${SITE}/projects/`, `${SITE}/id/projects/`]],
  [`${SITE}/id/blogs/`, [`${SITE}/blogs/`, `${SITE}/id/blogs/`]],
  [`${SITE}/id/projects/`, [`${SITE}/projects/`, `${SITE}/id/projects/`]],
]);

export default defineConfig({
  // sprint-13: stable origin for canonical URLs + sitemap (was request-derived).
  site: SITE,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    svelte(),
    sitemap({
      serialize(item) {
        const pair = HREFLANG_PAIRS.get(item.url);
        if (pair) {
          item.links = [
            { lang: 'en', url: pair[0] },
            { lang: 'id', url: pair[1] },
            { lang: 'x-default', url: pair[0] },
          ];
        }
        return item;
      },
    }),
  ],
});
