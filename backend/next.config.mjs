import path from 'path'
import { fileURLToPath } from 'url'

import { withPayload } from '@payloadcms/next/withPayload'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack was mis-inferring the workspace root (a stray package-lock.json
  // in the home dir), which broke CSS/asset chunk loading in the admin.
  // Pin it to this backend directory.
  turbopack: {
    root: __dirname,
  },
}

export default withPayload(nextConfig)
