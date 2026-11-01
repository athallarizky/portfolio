#!/usr/bin/env node
// sprint-30 (AEO): structured-data consistency checker.
//
// Answers layer-3 of AEO testing: does the JSON-LD agree with the page it lives on?
// (Emission + JSON validity are layers 1–2; schema.org/Google validators are layer 4
// and need a PUBLIC url — run this against prod after deploy.)
//
// Usage: node scripts/aeo-check.mjs [baseURL]        (default http://127.0.0.1:4998)
// Exit 0 = all green; 1 = any failure. Zero dependencies (Node 18+ global fetch).

const BASE = process.argv[2] || 'http://127.0.0.1:4998';

const results = [];
const check = (page, name, ok, detail = '') =>
  results.push({ page, name, ok, detail });

function extractLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);
  return blocks.map((b) => JSON.parse(b)); // throws on invalid JSON = the point
}
const metaContent = (html, key, attr = 'name') => {
  const m = html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`));
  // attributes are HTML-escaped; JSON-LD is not — decode before any comparison
  return m ? m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&') : null;
};

async function checkArticle(path, zone) {
  const html = await (await fetch(BASE + path)).text();
  const ld = extractLd(html);
  const types = ld.map((d) => d['@type']);
  const post = ld.find((d) => d['@type'] === 'BlogPosting' && d.headline);

  check(path, 'JSON-LD blocks all parse', true, `${types.join(', ')}`);
  check(path, 'BlogPosting present', !!post);
  check(path, 'BreadcrumbList present', types.includes('BreadcrumbList'));
  check(path, 'inLanguage matches zone', post?.inLanguage === zone, `got ${post?.inLanguage}`);
  check(path, 'headline matches og:title', post?.headline === metaContent(html, 'og:title', 'property')?.replace(' — Portfolio', ''),
    `${post?.headline?.slice(0, 30)}… vs og:title`);
  check(path, 'description matches meta description', post?.description === metaContent(html, 'description'));

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  check(path, 'mainEntityOfPage == canonical', post?.mainEntityOfPage === canonical, `${post?.mainEntityOfPage} vs ${canonical}`);

  // translation link must exist in the hreflang alternates with the same language
  const t = post?.workTranslation;
  if (t) {
    const altTag = html.match(new RegExp(`<link rel="alternate" hreflang="${t.inLanguage}" href="([^"]+)"`))?.[1];
    check(path, 'workTranslation ↔ hreflang alternate agree', t.url === altTag, `${t.url} vs ${altTag}`);
  } else {
    check(path, 'untranslated ⇒ no workTranslation', !html.includes('hreflang="id"'), 'consistent: none emitted');
  }

  check(path, 'image is absolute URL', typeof post?.image === 'string' && /^https?:\/\//.test(post.image));
  check(path, 'dates present', !!post?.datePublished && !!post?.dateModified);
}

async function checkProject(path) {
  const html = await (await fetch(BASE + path)).text();
  const ld = extractLd(html);
  const types = ld.map((d) => d['@type']);
  const web = ld.find((d) => d['@type'] === 'WebPage');
  const app = web?.about;

  check(path, 'JSON-LD blocks all parse', true, `${types.join(', ')}`);
  check(path, 'WebPage + SoftwareApplication present', !!web && app?.['@type'] === 'SoftwareApplication');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  check(path, 'WebPage.url == canonical', web?.url === canonical);
  // codeRepository only when a github link is visible on the page
  const pageHasGithub = /github\.com\/athallarizky/.test(html);
  check(path, 'codeRepository ⇔ visible github link', Boolean(app?.codeRepository) === pageHasGithub,
    `schema:${Boolean(app?.codeRepository)} page:${pageHasGithub}`);
  check(path, 'BreadcrumbList present', types.includes('BreadcrumbList'));
}

async function checkSitewide(path) {
  const html = await (await fetch(BASE + path)).text();
  const ld = extractLd(html);
  const person = ld.find((d) => d['@type'] === 'Person' && d.sameAs);
  check(path, 'Person.sameAs present & non-empty', Array.isArray(person?.sameAs) && person.sameAs.length > 0,
    person?.sameAs?.join(', ') || 'MISSING');
}

const ARTICLE = '/blogs/mcp-train-route-planning';
const PROJECT = '/projects/krl-mcp';

await checkArticle(ARTICLE, 'en');
await checkArticle('/id' + ARTICLE, 'id');
await checkProject(PROJECT);
await checkSitewide('/');

let fail = 0;
for (const r of results) {
  const mark = r.ok ? '✓' : '✗';
  if (!r.ok) fail++;
  console.log(`${mark} [${r.page}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
}
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
