import type { CollectionConfig } from 'payload'

/**
 * Admin users. `auth: true` gives Payload the email/password login flow used
 * by the /admin panel. Create the first user on initial `next dev` at /admin.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Access',
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
