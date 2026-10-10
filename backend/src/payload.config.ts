import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
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
import { Experiences } from './collections/Experiences'
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

// Sprint-27: adapters are env-switched so dev stays untouched — no env vars →
// SQLite + local disk; DATABASE_URL=postgres://… → Neon, S3_BUCKET set → R2.
const databaseUrl = process.env.DATABASE_URL || 'file:./payload.db'
const isPostgres = databaseUrl.startsWith('postgres') // matches postgres:// and postgresql://
const s3Enabled = Boolean(process.env.S3_BUCKET)

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
  collections: [Users, DocumentCategories, Documents, Tags, Authors, Articles, Technologies, Projects, Experiences, SocialProfiles, ContactMessages, Media],
  globals: [SiteConfig, Home, Nav],
  // Sprint-24: content-level bilingual (EN canonical + optional ID). UI stays English —
  // only Articles/Projects carry localized fields; slug stays single (one identity per item).
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Bahasa Indonesia', code: 'id' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || undefined,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // DB adapter by DATABASE_URL: postgres://… → Neon (prod), anything else → SQLite (dev).
  db: isPostgres
    ? postgresAdapter({ pool: { connectionString: databaseUrl } })
    : sqliteAdapter({ client: { url: databaseUrl } }),
  upload: {
    limits: { fileSize: 10 * 1024 * 1024 },
  },
  // Uploads: S3_BUCKET set → R2 via storage-s3 (prod). Unset → Payload's default local disk (dev).
  plugins: s3Enabled
    ? [
        s3Storage({
          config: {
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
            region: 'auto',
          },
          bucket: process.env.S3_BUCKET!,
          collections: {
            media: {
              // Serve via the R2 custom domain instead of the S3 endpoint:
              generateFileURL: ({ filename, prefix = '' }) =>
                `${process.env.S3_PUBLIC_BASE_URL}/${prefix}${filename}`,
            },
          },
        }),
      ]
    : [],
  cors,
  endpoints: dataSyncEndpoints,
})
