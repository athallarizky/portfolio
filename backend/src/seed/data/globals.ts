export const SITE_CONFIG = {
  name: 'Atha Tharizky',
  initials: 'AT',
  role: 'Full-Stack Engineer',
  bioShort: "I'm a full-stack engineer who likes shipping calm, reliable products. Most of my work lives at the intersection of backend systems, developer experience, and AI tooling.",
  status: 'Open to side-projects',
  timezone: 'UTC+7',
  location: 'Remote · UTC+7',
  contactFormEnabled: true,
  documentsEnabled: true,
}

export const HOME = {
  hero: { eyebrow: "// hello, I'm", name: 'Atha Tharizky' },
  stats: [
    { value: '6', suffix: '+', label: 'Years building' },
    { value: '24', suffix: '', label: 'Projects shipped' },
    { value: '3', suffix: '', label: 'Languages · TS/Go/Py' },
    { value: '∞', suffix: '', label: 'Cups of coffee' },
  ],
  about: [
    { paragraph: "I'm a full-stack engineer who likes shipping calm, reliable products. Most of my work lives at the intersection of backend systems, developer experience, and AI tooling." },
    { paragraph: 'Outside of code, I write notes about systems design, sprint workflows, and the occasional rant about over-engineered microservices.' },
  ],
  currently: [
    { icon: 'solar:bot-outline', text: 'Building internal AI tooling & dev platforms' },
    { icon: 'solar:magic-stick-2-line-duotone', text: 'Exploring agentic workflows & retrieval' },
  ],
  skills: [
    'TypeScript', 'React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL', 'Prisma', 'Docker', 'tRPC', 'TailwindCSS', 'OpenAI / RAG',
  ].map((name) => ({ name })),
  roles: [
    'Full-Stack Engineer',
    'Backend-leaning builder',
    'AI-tooling tinkerer',
    'TypeScript · Go · Python',
  ].map((label) => ({ label })),
}

export const NAV = {
  menuItems: [
    { label: 'Home', href: '/', icon: 'solar:user-id-outline', order: 1 },
    { label: 'Projects', href: '/projects', icon: 'solar:widget-5-bold-duotone', order: 2 },
    { label: 'Blogs', href: '/blogs', icon: 'solar:document-text-outline', order: 3 },
    { label: 'Documents', href: '/documents', icon: 'solar:folder-bold-duotone', order: 4 },
    { label: 'Socials', href: '/social', icon: 'solar:users-group-rounded-bold-duotone', order: 5 },
    { label: 'Contact', href: '/contact', icon: 'solar:letter-outline', order: 6 },
  ],
  connectLinks: [
    { label: 'GitHub', href: 'https://github.com', icon: 'mdi:github', order: 1 },
    { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'mdi:linkedin', order: 2 },
    { label: 'Email', href: 'mailto:hello@example.com', icon: 'solar:letter-outline', order: 3 },
  ],
}
