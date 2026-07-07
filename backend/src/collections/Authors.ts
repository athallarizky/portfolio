import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    group: 'Blog',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'initials', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'bio', type: 'textarea' },
  ],
}
