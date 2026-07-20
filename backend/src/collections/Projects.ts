import type { CollectionConfig } from 'payload'

import { uuidField, ensureUuid } from '../data-sync/identity'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Projects',
    defaultColumns: ['title', 'year', 'status'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [ensureUuid],
  },
  fields: [
    uuidField,
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'year', type: 'number', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'descriptor', type: 'text', admin: { description: 'Badge text, e.g. "Personal · OSS"' } },
    {
      name: 'techTags',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    { name: 'bannerColor', type: 'text', admin: { description: 'CSS gradient, e.g. linear-gradient(135deg,#9936e6,#5b21b6)' } },
    { name: 'bannerIcon', type: 'text', admin: { description: 'iconify icon, e.g. solar:rocket-bold' } },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text' },
        { name: 'icon', type: 'text' },
      ],
    },
    { name: 'body', type: 'richText' },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'published' },
    { name: 'order', type: 'number', defaultValue: 0 },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Feature in the Home "Selected work" strip' },
    },
    {
      name: 'seo',
      type: 'group',
      admin: { description: 'SEO metadata' },
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'text' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'icon', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'screenshots',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'bannerColor', type: 'text' },
        { name: 'icon', type: 'text' },
      ],
    },
    { name: 'architecture', type: 'code', admin: { language: 'plaintext', description: 'ASCII directory tree or architecture diagram' } },
  ],
}
