import { ARTICLES, ARTICLE_BODIES, TAGS } from './data/articles'
import { PROJECTS, PROJECT_BODIES } from './data/projects'
import { TECHNOLOGIES } from './data/technologies'
import { DOCUMENTS, CATEGORIES } from './data/documents'
import { SOCIAL_PROFILES } from './data/social'
import { SITE_CONFIG, HOME, NAV } from './data/globals'

function dry(label: string, items: unknown[]) {
  console.log(`\n=== ${label} (${items.length} items) ===`)
  items.forEach((item, i) => {
    const preview = typeof item === 'string' ? item : JSON.stringify(item).slice(0, 80)
    console.log(`  ${i + 1}. ${preview}${typeof item !== 'string' && JSON.stringify(item).length > 80 ? '...' : ''}`)
  })
}

dry('Tags', TAGS)
dry('Technologies', TECHNOLOGIES)
dry('Categories', CATEGORIES)
dry('Documents', DOCUMENTS.map((d) => `${d.title} (${d.category}: ${d.file})`))
dry('Articles', ARTICLES.map((a) => {
  const bodyCount = ARTICLE_BODIES[a.slug]?.length || 0
  return `${a.title} [${a.slug}] — ${a.tags.join(', ')} — ${bodyCount} body nodes`
}))
dry('Projects', PROJECTS.map((p) => {
  const bodyCount = PROJECT_BODIES[p.slug]?.length || 0
  return `${p.title} [${p.slug}] — ${p.techNames.join(', ')} — ${bodyCount} body nodes`
}))
dry('Social Profiles', SOCIAL_PROFILES.map((s) => `${s.platform} — ${s.handle}`))
console.log(`\n=== Globals ===`)
console.log(`  SiteConfig: ${SITE_CONFIG.name} (${SITE_CONFIG.role})`)
console.log(`  Home: hero=${HOME.hero.name}, stats=${HOME.stats.length}, skills=${HOME.skills.length}`)
console.log(`  Nav: ${NAV.menuItems.length} menu items, ${NAV.connectLinks.length} connect links`)

console.log('\n✅ Dry run complete — no data written.')
