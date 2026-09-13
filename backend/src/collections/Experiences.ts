import type { CollectionConfig } from 'payload'

import { uuidField, ensureUuid } from '../data-sync/identity'

// Work experience timeline (sprint-26). English-only for now — no localized fields,
// unlike Articles/Projects: entries are proper-noun heavy (companies, stacks, periods).
export const Experiences: CollectionConfig = {
  slug: 'experiences',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'role', 'period', 'order'],
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [ensureUuid],
  },
  fields: [
    uuidField,
    { name: 'company', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    {
      name: 'employmentType',
      type: 'text',
      admin: { description: 'e.g. Full-time, Freelance, Internship' },
    },
    { name: 'location', type: 'text' },
    {
      name: 'period',
      type: 'text',
      required: true,
      admin: { description: 'Free-form display period, e.g. "Jun 2024 — Present". Sorting uses `order`.' },
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Optional company website' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: { description: 'One to two sentences summarizing the role.' },
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'stack',
      type: 'array',
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
