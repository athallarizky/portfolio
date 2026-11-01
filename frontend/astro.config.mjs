// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Sprint-29: one trunk, two targets (plan.md D5). DEPLOY_TARGET=vps → node adapter
// (VPS prod, PM2 + nginx); unset/anything else → Vercel adapter (rollback target).
// Both adapters stay installed; only one is invoked at build time.
const onVps = process.env.DEPLOY_TARGET === 'vps';

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
  // Sprint-29: output follows the adapter — node standalone requires 'server';
  // the Vercel branch keeps sprint-27's 'static' + per-route `prerender = false`
  // (detail pages, contact API) so list/home pages build statically and ship
  // through Vercel ISR — see adapter note.
  site: SITE,
  output: onVps ? 'server' : 'static',
  // Sprint-27 (Vercel branch): adapter targets Vercel Functions; dev/local preview
  // behavior is the same as the node adapter. Astro pinned to v6 (sprint-27):
  // v7's rolldown bundler can't ship its native binding inside Vercel Functions
  // yet — revisit when the adapter fixes runtime tracing.
  // ISR: serve cached HTML and revalidate in the background (stale-while-revalidate),
  // so function cold starts and Neon's scale-to-zero never block a navigation.
  // Daily TTL — content changes only on publish, and publishes trigger an
  // on-demand rebuild via the Vercel Deploy Hook (publish-article.yml /
  // publish-project.yml). The TTL is only a self-heal safety net if a hook
  // ever fails; it also burns almost no CDN request budget (~1/day/route).
  //
  // Sprint-29 (VPS branch): node standalone behind nginx — PM2 keeps the process
  // warm (no cold starts), and nginx proxy_cache (60 s) replaces ISR. Deployed by
  // deploy.yml, which sets DEPLOY_TARGET=vps + PUBLIC_API_URL at build time.
  adapter: onVps
    ? node({ mode: 'standalone' })
    : vercel({
        isr: { expiration: 86400 },
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
