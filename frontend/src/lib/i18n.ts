// Locale model for the /id/ reading zone (sprint-25).
// UI chrome stays English everywhere; only localized CONTENT (title/excerpt/body/seo/features)
// renders Indonesian under /id/. EN pages are canonical and byte-identical to pre-sprint-25.

export type Locale = 'en' | 'id'

export const DEFAULT_LOCALE: Locale = 'en'
export const OVERLAY_LOCALES: Locale[] = ['id']

/** Query params that read a collection in the ID locale WITHOUT fallback — untranslated
 *  localized fields come back null, which is the translated-item detection primitive
 *  (sprint-24 phase-0 finding). */
export const ID_NO_FALLBACK = 'locale=id&fallback-locale=none'

/** Prefix a path with the locale zone: localePath('id', '/blogs/x') → '/id/blogs/x'. */
export function localePath(locale: Locale, path: string): string {
  return locale === 'id' ? `/id${path}` : path
}

/** A doc fetched with locale=id&fallback-locale=none is translated iff its localized
 *  title exists (title is required, so null ⇒ the record has no ID values at all). */
export function isTranslated(doc: { title?: string | null } | null | undefined): boolean {
  return !!doc && doc.title != null
}

/** Appends the no-fallback ID query to a list endpoint path (joins with ? or & correctly). */
export function withIdNoFallback(path: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}${ID_NO_FALLBACK}`
}
