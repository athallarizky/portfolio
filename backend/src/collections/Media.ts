import type { CollectionConfig } from 'payload'

import { uuidField, ensureUuid } from '../data-sync/identity'

/**
 * Shared media library. Upload-enabled collection that holds ALL images for the site:
 * author avatars, project screenshots, article feature images, user profile photos,
 * and inline images embedded in Lexical rich text.
 *
 * Other collections reference media via `{ type: 'upload', relationTo: 'media' }`.
 *
 * Image sizes:
 *   thumbnail — 400×300 (admin preview + card thumbnails)
 *   card      — 768 width, auto height (project/article cards)
 *   hero      — 1200 width, auto height (project/article hero banners)
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Media',
    defaultColumns: ['alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [ensureUuid],
  },
  upload: {
    staticDir: 'media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre', fit: 'cover' },
      { name: 'card', width: 768, fit: 'cover' },
      { name: 'hero', width: 1200, fit: 'cover' },
    ],
  },
  fields: [
    uuidField,
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'textarea' },
  ],
}
