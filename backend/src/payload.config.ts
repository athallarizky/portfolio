import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { DocumentCategories } from './collections/DocumentCategories'
import { Documents } from './collections/Documents'
import { Tags } from './collections/Tags'
import { Authors } from './collections/Authors'
import { Articles } from './collections/Articles'
import { Technologies } from './collections/Technologies'
import { Projects } from './collections/Projects'
import { SocialProfiles } from './collections/SocialProfiles'
import { ContactMessages } from './collections/ContactMessages'
import { Media } from './collections/Media'

import { SiteConfig } from './globals/SiteConfig'
import { Home } from './globals/Home'
import { Nav } from './globals/Nav'

import { dataSyncEndpoints } from './data-sync/endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const cors = (process.env.PAYLOAD_PUBLIC_CORS || 'http://localhost:8080')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      afterNav: ['/data-sync/admin/DataSyncNavLink#DataSyncNavLink'],
      views: {
        dataSync: {
          Component: '/data-sync/admin/DataSyncView#DataSyncView',
          path: '/data-sync',
        },
      },
    },
  },
  collections: [Users, DocumentCategories, Documents, Tags, Authors, Articles, Technologies, Projects, SocialProfiles, ContactMessages, Media],
  globals: [SiteConfig, Home, Nav],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // DB adapter: SQLite for dev. For production Postgres, swap to:
  //   import { postgresAdapter } from '@payloadcms/db-postgres'
  //   db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL! } })
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./payload.db' },
  }),
  // Uploads: local disk for dev. For production S3/R2:
  //   npm install @payloadcms/plugin-cloud-storage @aws-sdk/client-s3
  upload: {
    limits: { fileSize: 10 * 1024 * 1024 },
  },
  cors,
  endpoints: dataSyncEndpoints,
})
