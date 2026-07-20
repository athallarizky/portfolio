// Content-level identity: an immutable uuid per content record.
//
// Set by a beforeChange hook on CREATE only (never on update), so identity stays stable across
// renames while remaining portable between envs (it's a content field, not the DB id). The uuid is
// the upsert/merge key used by the data-sync engine (sprint-15); the natural key stays as the
// display handle + v1-archive fallback.
//
// Import pass-through is automatic: the importer supplies data.uuid, so the hook sees it present
// and does nothing — an explicitly provided uuid is always preserved.

import { randomUUID } from 'node:crypto'
import type { TextField } from 'payload'

/** Immutable content-level uuid — hidden from editors (admin.disabled), unique, indexed.
 *  Assigned automatically on create by `ensureUuid`; never edited by hand. */
export const uuidField: TextField = {
  name: 'uuid',
  type: 'text',
  unique: true,
  index: true,
  admin: { disabled: true },
}

/** Structural hook-arg type (kept local so this module is independent of the generated types). */
type BeforeChangeArgs = {
  data: Record<string, unknown>
  operation: 'create' | 'update'
  req?: unknown
  originalDoc?: unknown
  context?: unknown
}

/** beforeChange hook: fill uuid on create when missing; no-op on update (uuid is immutable). */
export const ensureUuid = ({ data, operation }: BeforeChangeArgs) => {
  if (operation === 'create' && data && !data.uuid) {
    data.uuid = randomUUID()
  }
  return data
}
