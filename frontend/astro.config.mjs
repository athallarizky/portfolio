// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';
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
  // Sprint-27: 'static' + per-route `prerender = false` (detail pages, contact API) so
  // list/home pages build statically and ship through Vercel ISR — see adapter note.
  site: SITE,
  output: 'static',
  // Sprint-27: Vercel adapter (prod). `output: 'server'` unchanged — the adapter targets
  // Vercel Functions; dev/local preview behavior is the same as the node adapter.
  // Astro pinned to v6 (sprint-27): v7's rolldown bundler can't ship its native binding
  // inside Vercel Functions yet — revisit when the adapter fixes runtime tracing.
  // ISR: serve cached HTML and revalidate in the background (stale-while-revalidate),
  // so function cold starts and Neon's scale-to-zero never block a navigation.
  // Content is publish-driven only — a 5-minute staleness window is invisible.
  adapter: vercel({
    isr: { expiration: 300 },
  }),
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
