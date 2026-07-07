import type { CollectionConfig } from 'payload'

/**
 * Document groups shown on the Documents page (Pinned / Research / Other…).
 * `order` controls display sequence; empty categories are hidden client-side.
 * This is the "categories grouping" concept — documents reference it via a
 * relationship field (see Documents.ts).
 *
 * Public read: the static frontend fetches these with no auth.
 */
export const DocumentCategories: CollectionConfig = {
  slug: 'document-categories',
  admin: {
    useAsTitle: 'label',
    group: 'Documents',
    description: 'Ordered groups for the Documents page. Sort by `order`.',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe id, e.g. pinned, research, other' },
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: { description: 'iconify icon, e.g. solar:pin-bold-duotone' },
    },
    { name: 'hint', type: 'textarea' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { step: 1, description: 'Lower sorts first' },
    },
  ],
}
