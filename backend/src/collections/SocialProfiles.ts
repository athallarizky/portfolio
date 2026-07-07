import type { CollectionConfig } from 'payload'

export const SocialProfiles: CollectionConfig = {
  slug: 'social-profiles',
  admin: {
    useAsTitle: 'platform',
    group: 'Social',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'platform', type: 'text', required: true },
    { name: 'icon', type: 'text', required: true, admin: { description: 'iconify icon, e.g. simple-icons:github' } },
    { name: 'handle', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'showOnHome', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
