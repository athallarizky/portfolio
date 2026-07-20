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
