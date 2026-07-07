import type { GlobalConfig } from 'payload'

export const Nav: GlobalConfig = {
  slug: 'nav',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
  },
  fields: [
    {
      name: 'menuItems',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'icon', type: 'text' },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
    {
      name: 'connectLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'icon', type: 'text' },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
