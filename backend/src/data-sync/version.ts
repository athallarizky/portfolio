// Resolve an installed dependency's version without importing its `./package.json`
// subpath (Payload v3's `exports` map doesn't expose it → ERR_PACKAGE_PATH_NOT_EXPORTED).
// Shared by the export CLI and the export endpoint.

import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export function resolvePkgVersion(name: string): string {
  try {
    let dir = path.dirname(require.resolve(name))
    for (let i = 0; i < 10; i++) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
        if (pkg.name === name) return pkg.version as string
      } catch {
        /* keep walking up */
      }
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  } catch {
    /* package not resolvable */
  }
  return 'unknown'
}
