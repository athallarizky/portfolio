import type { CollectionConfig } from 'payload'

import { uuidField, ensureUuid } from '../data-sync/identity'

/**
 * Downloadable documents. `upload: true` makes this a media collection —
 * Payload auto-tracks `filename`, `filesize`, `mimeType`, `updatedAt`, so the
 * frontend gets size + file type for free (replaces the old hand-typed
 * `size`/`file` strings in frontend/assets/documents.js).
 *
 * `category` is a relationship to document-categories — the grouping FK.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    group: 'Documents',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [ensureUuid],
  },
  upload: true,
  fields: [
    uuidField,
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'document-categories',
      required: true,
    },
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'updated',
      type: 'text',
      admin: {
        description: 'Display string, e.g. "Jul 2026". If empty, Payload updatedAt is used.',
      },
    },
  ],
}
