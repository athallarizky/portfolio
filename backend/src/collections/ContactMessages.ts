import type { CollectionConfig } from 'payload'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),  // admin-only; public cannot list submissions
    create: () => true,                          // anyone can submit via the contact form
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true },
  ],
}
