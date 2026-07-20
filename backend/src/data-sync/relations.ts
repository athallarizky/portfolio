// Dependency-ordered import planning + identity resolution.
//
// Identity is the content-level `uuid` (sprint-15). The resolver tracks BOTH uuid→id and
// natural-key→id so relations can resolve rename-safely: try the target's uuid first, fall back to
// its natural key (v1 archives / un-backfilled records have no uuid).

import { IMPORT_ORDER } from './keys'
import type { ContentCollection } from './types'

export class UnresolvedRelationError extends Error {
  constructor(
    public readonly to: string,
    public readonly key: string,
    public readonly fromField: string,
  ) {
    super(`unresolved relation → "${to}"("${key}") (from ${fromField})`)
    this.name = 'UnresolvedRelationError'
  }
}

export interface IdResolver {
  /** Track an imported record by natural key (and uuid, when present). */
  set(collection: ContentCollection, naturalKey: string, id: number | string, uuid?: string): void
  /** Resolve a relation ref: uuid first (rename-safe), then natural key. */
  resolve(collection: ContentCollection, ref: { uuid?: string; key: string }): number | string | undefined
  /** Look up by natural key only. */
  get(collection: ContentCollection, naturalKey: string): number | string | undefined
  /** Look up by uuid only. */
  getByUuid(collection: ContentCollection, uuid: string): number | string | undefined
}

/** Build an empty id resolver (collection → {natural-key→id, uuid→id}). */
export function makeIdResolver(): IdResolver {
  const byKey = new Map<ContentCollection, Map<string, number | string>>()
  const byUuid = new Map<ContentCollection, Map<string, number | string>>()
  return {
    set(collection, naturalKey, id, uuid) {
      let mk = byKey.get(collection)
      if (!mk) {
        mk = new Map()
        byKey.set(collection, mk)
      }
      mk.set(naturalKey, id)
      if (uuid) {
        let mu = byUuid.get(collection)
        if (!mu) {
          mu = new Map()
          byUuid.set(collection, mu)
        }
        mu.set(uuid, id)
      }
    },
    resolve(collection, ref) {
      if (ref.uuid) {
        const id = byUuid.get(collection)?.get(ref.uuid)
        if (id !== undefined) return id
      }
      return byKey.get(collection)?.get(ref.key)
    },
    get(collection, naturalKey) {
      return byKey.get(collection)?.get(naturalKey)
    },
    getByUuid(collection, uuid) {
      return byUuid.get(collection)?.get(uuid)
    },
  }
}

/** Look up a related doc's id by natural key; throw UnresolvedRelationError if missing. */
export function resolveRef(
  collection: ContentCollection,
  naturalKey: string,
  resolver: IdResolver,
  fromField: string,
): number | string {
  const id = resolver.get(collection, naturalKey)
  if (id === undefined) throw new UnresolvedRelationError(collection, naturalKey, fromField)
  return id
}

/** Topological import order, filtered to collections present in the archive. */
export function planImportOrder(present: ReadonlySet<string>): ContentCollection[] {
  return IMPORT_ORDER.filter((c) => present.has(c))
}
