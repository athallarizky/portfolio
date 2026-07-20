// Dependency-ordered import planning + natural-key → id resolution.

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
  set(collection: ContentCollection, naturalKey: string, id: number | string): void
  get(collection: ContentCollection, naturalKey: string): number | string | undefined
}

/** Build an empty id resolver (collection → natural-key → id). */
export function makeIdResolver(): IdResolver {
  const store = new Map<ContentCollection, Map<string, number | string>>()
  return {
    set(collection, naturalKey, id) {
      let m = store.get(collection)
      if (!m) {
        m = new Map()
        store.set(collection, m)
      }
      m.set(naturalKey, id)
    },
    get(collection, naturalKey) {
      return store.get(collection)?.get(naturalKey)
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
