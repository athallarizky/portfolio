import type { CollectionConfig } from 'payload'

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
  fields: [
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
    {
      name: 'statsFooter',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    { name: 'architecture', type: 'code', admin: { language: 'plaintext', description: 'ASCII directory tree or architecture diagram' } },
  ],
}
