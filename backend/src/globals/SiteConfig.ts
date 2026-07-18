import type { GlobalConfig } from 'payload'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'initials', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'bioShort', type: 'textarea' },
    { name: 'status', type: 'text', admin: { description: 'e.g. "Open to side-projects"' } },
    { name: 'timezone', type: 'text', admin: { description: 'e.g. "UTC+7"' } },
    { name: 'location', type: 'text', admin: { description: 'e.g. "Remote · UTC+7"' } },
    { name: 'contactFormEnabled', type: 'checkbox', defaultValue: true, admin: { description: 'Show the contact form and accept submissions' } },
    { name: 'documentsEnabled', type: 'checkbox', defaultValue: true, admin: { description: 'Show the documents/downloads page' } },
  ],
}
