import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'name', type: 'text' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'suffix', type: 'text' },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'about',
      type: 'array',
      fields: [
        { name: 'paragraph', type: 'textarea', required: true },
      ],
    },
    {
      name: 'currently',
      type: 'array',
      fields: [
        { name: 'icon', type: 'text' },
        { name: 'text', type: 'text', required: true },
      ],
    },
    {
      name: 'skills',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
      ],
    },
  ],
}
