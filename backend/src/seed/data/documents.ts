export const CATEGORIES = [
  { label: 'Pinned', slug: 'pinned', icon: 'solar:pin-bold-duotone', hint: 'The essentials — résumé, CV, cover letter.', order: 1 },
  { label: 'Research', slug: 'research', icon: 'solar:book-2-outline', hint: 'Write-ups, templates, and notes I keep returning to.', order: 2 },
  { label: 'Other', slug: 'other', icon: 'solar:folder-2-outline', hint: 'Miscellaneous files and references.', order: 3 },
]

export const DOCUMENTS = [
  { title: 'Résumé', category: 'pinned', file: 'atha-tharizky-resume.pdf', excerpt: 'One-page summary of my experience, roles, and the work I have shipped.', updated: 'Jul 2026' },
  { title: 'CV — Detailed', category: 'pinned', file: 'atha-tharizky-cv.pdf', excerpt: 'Full chronology: roles, talks, open-source contributions, and side projects.', updated: 'Jun 2026' },
  { title: 'Cover Letter Template', category: 'pinned', file: 'atha-tharizky-cover-letter.pdf', excerpt: 'A reusable template I tailor for each role I apply to.', updated: 'Apr 2026' },
  { title: 'AI Workflow Template', category: 'research', file: 'ai-workflow-template.md', excerpt: 'How I run a software project with an AI agent — PRD to production, phase by phase.', updated: 'Jul 2026' },
  { title: 'Case Study — Rent-House-AI', category: 'research', file: 'rent-house-ai-case-study.pdf', excerpt: 'Deep dive: listing scraper → RAG pipeline → semantic search across five services.', updated: 'May 2026' },
  { title: 'References', category: 'other', file: 'atha-tharizky-references.pdf', excerpt: 'Contact details for past collaborators and managers — available on request.', updated: 'Mar 2026' },
]
