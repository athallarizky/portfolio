// Natural-key + relationship map: the portability core.
// Local and prod assign different DB ids, so relationships are serialized as
// natural keys (slug/name/title/platform) and resolved back to ids on import.

import type { ContentCollection, RelationDef } from './types'

/** collection → the field used as the upsert key. */
export const NATURAL_KEYS: Record<ContentCollection, string> = {
  'document-categories': 'slug',
  documents: 'title',
  tags: 'slug',
  authors: 'name',
  articles: 'slug',
  technologies: 'slug',
  projects: 'slug',
  'social-profiles': 'platform',
  media: 'filename',
}

/** Relationships to rewrite, keyed by source collection. */
export const RELATIONS: Partial<Record<ContentCollection, RelationDef[]>> = {
  articles: [
    { field: 'tags', to: 'tags', hasMany: true },
    { field: 'author', to: 'authors', hasMany: false, required: true },
    { field: 'relatedArticles', to: 'articles', hasMany: true, selfRef: true },
  ],
  documents: [{ field: 'category', to: 'document-categories', hasMany: false, required: true }],
  projects: [{ field: 'techTags', to: 'technologies', hasMany: true }],
}

/** Topological import order — parents before children (matches the seed phase order). */
export const IMPORT_ORDER: ContentCollection[] = [
  'document-categories',
  'documents',
  'media',
  'tags',
  'authors',
  'articles',
  'technologies',
  'projects',
  'social-profiles',
]

/** Collections that can be the target of a relationship — pre-fetched as id→key maps on export. */
export const RELATION_TARGETS: ContentCollection[] = [
  'document-categories',
  'tags',
  'authors',
  'technologies',
  'articles',
]

/** Collections whose body field is Lexical rich text (↔ Markdown on export/import). */
export const RICH_TEXT_BODY: Partial<Record<ContentCollection, string>> = {
  articles: 'body',
  projects: 'body',
}

// ---- Locale overlay model (sprint-24) ----

/** Canonical/default locale — its values live at the archive-row top level (v2 shape). */
export const DEFAULT_LOCALE = 'en'
/** Locales that ride in archive rows as `locales.<code>` overlays (everything but the default). */
export const OVERLAY_LOCALES = ['id'] as const

/** collection → localized field paths (dotted for group subfields). Single source of
 *  truth for the data-sync overlay model — keep in lockstep with the `localized: true`
 *  flags in the collection configs (Articles/Projects). */
export const LOCALIZED_FIELDS: Partial<Record<ContentCollection, readonly string[]>> = {
  articles: ['title', 'excerpt', 'body', 'seo.metaTitle', 'seo.metaDescription'],
  projects: ['title', 'excerpt', 'body', 'features', 'seo.metaTitle', 'seo.metaDescription'],
}

/** A relationship pointing AT a collection (the inverse of a RelationDef) — used by merge. */
export interface InverseRelation {
  fromCollection: ContentCollection
  field: string
  hasMany: boolean
  selfRef: boolean
}

/** For a target collection, every (collection, field) with a relationship pointing AT it.
 *  Derived from `RELATIONS` — single source of truth, so a new relationship auto-flows into merge. */
export function inverseRelations(): Map<ContentCollection, InverseRelation[]> {
  const inv = new Map<ContentCollection, InverseRelation[]>()
  for (const [from, rels] of Object.entries(RELATIONS) as [ContentCollection, RelationDef[]][]) {
    for (const rel of rels) {
      let arr = inv.get(rel.to)
      if (!arr) {
        arr = []
        inv.set(rel.to, arr)
      }
      arr.push({ fromCollection: from, field: rel.field, hasMany: rel.hasMany, selfRef: !!rel.selfRef })
    }
  }
  return inv
}
