// Detail loaders for the bilingual content routes (sprint-25).
// Routes own the redirect decisions (Astro.redirect only works in page frontmatter —
// a component-level call is a silent no-op); these loaders classify the outcome.

import { safeFetch, API_ORIGIN, mediaUrl } from './api';
import { isTranslated, withIdNoFallback, type Locale } from './i18n';
import type { Article, Project, PaginatedResponse } from './api-types';

export type DetailResult<T> =
  | { status: 'not-found' }
  | { status: 'untranslated' }
  | { status: 'ok'; doc: T; translated: boolean };

/** Shared banner-URL derivation (hero size → full media → null). */
export function bannerUrlOf(featured: { sizes?: { hero?: { url?: string } }; url?: string | null } | null | undefined): string | null {
  return featured?.sizes?.hero?.url ? `${API_ORIGIN}${featured.sizes.hero.url}` : mediaUrl(featured as any);
}

export async function loadArticleDetail(locale: Locale, slug: string | undefined): Promise<
  DetailResult<Article> & { relatedArticles?: Article[] }
> {
  if (!slug) return { status: 'not-found' };

  const listPath = '/articles?where[status][equals]=published&sort=-publishedAt&depth=2&limit=100';
  const all = await safeFetch<PaginatedResponse<Article>>(
    locale === 'id' ? withIdNoFallback(listPath) : listPath,
  );
  const docs = (all.docs || []) as Article[];
  const article = docs.find((a) => a.slug === slug);

  if (locale === 'id') {
    if (!article) return { status: 'not-found' };
    if (!isTranslated(article)) return { status: 'untranslated' }; // /id/<slug> → 301 to EN
  } else if (!article) {
    return { status: 'not-found' };
  }

  // Translated-ness drives the switcher + hreflang on the EN page (one light probe).
  let translated = locale === 'id';
  if (locale === 'en') {
    const probe = await safeFetch<PaginatedResponse<Article>>(
      `/articles?where[slug][equals]=${slug}&depth=0&locale=id&fallback-locale=none`,
    );
    translated = isTranslated(((probe.docs || []) as Article[])[0]);
  }

  const tagIds = new Set((article.tags || []).map((t) => t.id));
  const relatedArticles = docs
    .filter((a) => a.slug !== slug)
    .filter((a) => (locale === 'id' ? isTranslated(a) : true))
    .map((a) => ({ a, shared: (a.tags || []).filter((t) => tagIds.has(t.id)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 5)
    .map((x) => x.a);

  return { status: 'ok', doc: article, translated, relatedArticles };
}

export async function loadProjectDetail(locale: Locale, slug: string | undefined): Promise<
  DetailResult<Project> & { nextProject?: Project | null; otherProjects?: Project[] }
> {
  if (!slug) return { status: 'not-found' };

  const listPath = '/projects?sort=order&depth=1&limit=100';
  const allData = await safeFetch<PaginatedResponse<Project>>(
    locale === 'id' ? withIdNoFallback(listPath) : listPath,
  );
  const docs = (allData.docs || []) as Project[];
  const project = docs.find((p) => p.slug === slug);

  if (locale === 'id') {
    if (!project) return { status: 'not-found' };
    if (!isTranslated(project)) return { status: 'untranslated' };
  } else if (!project) {
    return { status: 'not-found' };
  }

  let translated = locale === 'id';
  if (locale === 'en') {
    const probe = await safeFetch<PaginatedResponse<Project>>(
      `/projects?where[slug][equals]=${slug}&depth=0&locale=id&fallback-locale=none`,
    );
    translated = isTranslated(((probe.docs || []) as Project[])[0]);
  }

  const inZone = (p: Project) => (locale === 'id' ? isTranslated(p) : true);
  const nextProject = docs
    .filter((p) => p.order > project.order && inZone(p))
    .sort((a, b) => a.order - b.order)[0] || null;
  const otherProjects = docs
    .filter((p) => p.slug !== slug && p.status === 'published' && inZone(p))
    .slice(0, 5);

  return { status: 'ok', doc: project, translated, nextProject, otherProjects };
}
