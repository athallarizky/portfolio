import type { CollectionConfig } from 'payload'

import { uuidField, ensureUuid } from '../data-sync/identity'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    group: 'Blog',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [ensureUuid],
  },
  fields: [
    uuidField,
    { name: 'name', type: 'text', required: true },
    { name: 'initials', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'bio', type: 'textarea' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
