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
    {
      name: 'roles',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'showItems',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Hero', value: 'hero' },
        { label: 'Stats', value: 'stats' },
        { label: 'About', value: 'about' },
        { label: 'Currently', value: 'currently' },
        { label: 'Skills', value: 'skills' },
        { label: 'Find me', value: 'findMe' },
        { label: "Let's talk (CTA)", value: 'contactCta' },
      ],
      defaultValue: ['hero', 'stats', 'about', 'currently', 'skills', 'findMe', 'contactCta'],
    },
  ],
}
