import type { CollectionConfig } from 'payload'

import { uuidField, ensureUuid } from '../data-sync/identity'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    group: 'Blog',
    components: {
      afterListTable: ['/data-sync/admin/InsertArticleFromJson#InsertArticleFromJson'],
    },
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
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
    },
    { name: 'publishedAt', type: 'date', required: true },
    { name: 'readMinutes', type: 'number', min: 1 },
    { name: 'body', type: 'richText' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'bannerColor', type: 'text', admin: { description: 'CSS gradient for the banner, e.g. linear-gradient(135deg,#9936e6,#5b21b6)' } },
    { name: 'bannerIcon', type: 'text', admin: { description: 'iconify icon for the banner, e.g. solar:rocket-bold' } },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'published',
    },
    {
      name: 'seo',
      type: 'group',
      admin: { description: 'SEO metadata' },
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'text', admin: { description: 'URL or path to OG image' } },
      ],
    },
  ],
}
