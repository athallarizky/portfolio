// Locale overlay model (sprint-24) — shared by export (normalizing `locale: 'all'`
// reads) and the archive writers (single/wrap-publish deciding the emit version).
//
// v3 row shape: EN values live at the top level (v2-identical); translations ride
// under `locales.<code>` carrying ONLY localized fields with values in that locale:
//
//   { uuid, slug, title: "<EN>", body: "<EN md>", …,
//     locales: { id: { title: "<ID>", body: "<ID md>", seo: { metaTitle: "<ID>" } } } }
//
// Import writes the top level with locale `en` and each overlay with its own locale —
// Payload never touches the other locale's values (phase-0 finding), which is the
// whole non-clobber guarantee.

import { DEFAULT_LOCALE, LOCALIZED_FIELDS, OVERLAY_LOCALES } from './keys'
import type { ContentCollection } from './types'

/** Per-locale overlays on an archive row: locale code → localized-field values. */
export interface LocaleOverlays {
  [locale: string]: Record<string, any>
}

/** A locale-map value from a `locale: 'all'` read — `{ en?: v, id?: v }` keyed by
 *  locale. RichText states (`{ root }`), arrays and plain strings never match. */
export function isLocaleMap(v: unknown): v is Record<string, unknown> {
  if (v == null || typeof v !== 'object' || Array.isArray(v)) return false
  return DEFAULT_LOCALE in v || OVERLAY_LOCALES.some((l) => l in v)
}

/** Meaningful = has content (untranslated locales read as null/absent). */
function meaningful(v: unknown): boolean {
  if (v == null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  return true
}

/** Strip DB-assigned row ids from localized array items (e.g. project features) —
 *  they are environment-local and must never leak across environments. */
function stripItemIds(v: unknown): unknown {
  if (!Array.isArray(v)) return v
  return v.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item) && 'id' in item) {
      const { id: _drop, ...rest } = item as Record<string, unknown>
      return rest
    }
    return item
  })
}

function getPath(obj: Record<string, any>, path: string): unknown {
  return path.split('.').reduce<any>((acc, seg) => (acc == null ? acc : acc[seg]), obj)
}

function setPath(obj: Record<string, any>, path: string, value: unknown): void {
  const segs = path.split('.')
  let cur = obj
  for (const seg of segs.slice(0, -1)) {
    if (typeof cur[seg] !== 'object' || cur[seg] == null) cur[seg] = {}
    cur = cur[seg]
  }
  cur[segs[segs.length - 1]] = value
}

function deletePath(obj: Record<string, any>, path: string): void {
  const segs = path.split('.')
  let cur: any = obj
  for (const seg of segs.slice(0, -1)) {
    cur = cur?.[seg]
    if (cur == null) return
  }
  delete cur[segs[segs.length - 1]]
}

export class OverlayValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OverlayValidationError'
  }
}

/** Validate an authored overlay object (`*.id.json` content or `locales.id` value):
 *  localized fields only — top-level keys must map to LOCALIZED_FIELDS paths, `seo`
 *  only accepts its localized subfields. Catches authoring typos before they ride
 *  into an archive. Identity keys (uuid/slug) are checked by the caller. */
export function validateOverlayRow(
  collection: ContentCollection,
  overlay: Record<string, unknown>,
): void {
  const fields = LOCALIZED_FIELDS[collection]
  if (!fields) {
    throw new OverlayValidationError(`collection "${collection}" has no localized fields`)
  }
  const allowedTop = new Set(fields.map((f) => f.split('.')[0]))
  for (const key of Object.keys(overlay)) {
    if (!allowedTop.has(key)) {
      throw new OverlayValidationError(
        `"${key}" is not a localized field of ${collection} (allowed: ${[...allowedTop].join(', ')})`,
      )
    }
  }
  const seoFields = fields.filter((f) => f.startsWith('seo.')).map((f) => f.split('.')[1])
  const seo = overlay.seo as Record<string, unknown> | undefined
  if (seo) {
    for (const key of Object.keys(seo)) {
      if (!seoFields.includes(key)) {
        throw new OverlayValidationError(
          `"seo.${key}" is not localized (allowed: ${seoFields.map((f) => `seo.${f}`).join(', ')})`,
        )
      }
    }
  }
}

/** Does an archive row carry any overlay-locale values? Drives the emit-version rule. */
export function rowHasOverlay(row: Record<string, unknown>): boolean {
  const locales = row.locales
  if (!locales || typeof locales !== 'object' || Array.isArray(locales)) return false
  return OVERLAY_LOCALES.some((l) => {
    const overlay = (locales as LocaleOverlays)[l]
    return !!overlay && typeof overlay === 'object' && Object.keys(overlay).length > 0
  })
}

/** schemaVersion to stamp: 3 when any row carries an overlay, else 2 — EN-only
 *  archives stay byte-compatible with (and importable by) a deployed v2 importer. */
export function archiveSchemaVersion(rowSets: Record<string, unknown>[][]): 2 | 3 {
  return rowSets.some((rows) => rows.some(rowHasOverlay)) ? 3 : 2
}

/** Normalize a `locale: 'all'` doc IN PLACE into the v3 row shape: each localized
 *  field collapses to its EN value (deleted when EN has none); translations move
 *  under `locales.<code>`. Array items are stripped of DB-local ids. Returns whether
 *  an overlay was attached. Collections without localized fields are a no-op. */
export function splitLocalizedRow(
  collection: ContentCollection,
  row: Record<string, any>,
): boolean {
  const fields = LOCALIZED_FIELDS[collection]
  if (!fields) return false
  const overlays: Record<string, Record<string, any>> = {}
  for (const field of fields) {
    const v = getPath(row, field)
    if (!isLocaleMap(v)) continue // flat value — EN only, no translation exists
    if (meaningful(v[DEFAULT_LOCALE])) setPath(row, field, stripItemIds(v[DEFAULT_LOCALE]))
    else deletePath(row, field)
    for (const locale of OVERLAY_LOCALES) {
      const lv = v[locale]
      if (!meaningful(lv)) continue
      if (!overlays[locale]) overlays[locale] = {}
      setPath(overlays[locale], field, stripItemIds(lv))
    }
  }
  const has = Object.values(overlays).some((o) => Object.keys(o).length > 0)
  if (has) row.locales = overlays
  return has
}
