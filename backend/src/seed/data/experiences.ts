// Work experience seed data — curated from AthallaRizky_Resume_06_26-4.pdf (sprint-26).
// Full resume bullets live in the PDF; each entry keeps the most impactful highlights.

type ExperienceSeed = {
  company: string
  role: string
  employmentType: string
  location: string
  period: string
  url?: string
  description: string
  highlights: { text: string }[]
  stack: { name: string }[]
  order: number
}

export const EXPERIENCES: ExperienceSeed[] = [
  {
    company: 'Kitabisa',
    role: 'Software Engineer — Front End',
    employmentType: 'Full-time',
    location: 'Jakarta, Indonesia (Hybrid)',
    period: 'Jun 2024 — Present',
    url: 'https://kitabisa.com',
    description:
      'Building and maintaining the Kitabisa.com crowdfunding platform while shipping AI-powered internal tooling for engineering teams.',
    highlights: [
      {
        text: 'Built AI-powered internal apps that analyze Grafana bug timelines and turn technical event data into structured, human-readable reports for faster investigation and triage.',
      },
      {
        text: 'Built a RAG application over Slack thread conversations that summarizes bug reports and surfaces relevant technical context.',
      },
      {
        text: 'Standardized engineering workflows as reusable AI agent skills — repository setup, database patching, and frontend repo rules.',
      },
      {
        text: 'Developed Next.js + TypeScript features for the crowdfunding platform and contributed to SalingJaga, the insurance app.',
      },
    ],
    stack: [
      'Next.js',
      'TypeScript',
      'React Query',
      'Material UI',
      'Tailwind CSS',
      'Zustand',
      'AI Agents',
      'RAG',
    ].map((name) => ({ name })),
    order: 1,
  },
  {
    company: 'Redikru',
    role: 'Software Engineer — Front End',
    employmentType: 'Full-time',
    location: 'Jakarta, Indonesia (Hybrid)',
    period: 'Dec 2023 — Jun 2024',
    description:
      'Front-end engineer across a maritime-crew recruitment platform: internal CMS, company dashboard, and a React Native app for sailors.',
    highlights: [
      {
        text: 'Built an internal CMS dashboard (React, TypeScript, Tailwind) managing sailing companies, crew members, certificates, and validation workflows.',
      },
      {
        text: 'Developed a company-facing platform for job vacancies, recruitment, and vessel management, plus a React Native app for sailors with chat and certificate tracking.',
      },
      {
        text: 'Composed reusable components following Atomic Design, with i18n across web and mobile.',
      },
    ],
    stack: [
      'React.js',
      'React Native',
      'TypeScript',
      'Tailwind CSS',
      'Tamagui',
      'Redux Toolkit',
      'TanStack Query',
    ].map((name) => ({ name })),
    order: 2,
  },
  {
    company: 'Solar Chapter',
    role: 'Freelance Software Engineer — Front End',
    employmentType: 'Freelance',
    location: 'Jakarta, Indonesia (Remote)',
    period: 'Sep 2023 — Feb 2024',
    description:
      'Freelance build of a web-based monitoring platform for IoT hardware systems with real-time operational visibility.',
    highlights: [
      {
        text: 'Built the monitoring UI with Next.js, TypeScript, and Chakra UI.',
      },
      {
        text: 'Wired real-time data interaction through Axios and TanStack Query, with authentication and sessions via NextAuth.js.',
      },
    ],
    stack: ['Next.js', 'TypeScript', 'Chakra UI', 'TanStack Query', 'Recoil', 'NextAuth.js'].map(
      (name) => ({ name }),
    ),
    order: 3,
  },
  {
    company: 'The Digital Cellar',
    role: 'Freelance Software Engineer — Front End',
    employmentType: 'Freelance',
    location: 'Brisbane, Australia (Remote)',
    period: 'Oct 2023 — Nov 2023',
    description:
      'Short engagement building an event-ticketing, course-delivery, and gated-content web platform.',
    highlights: [
      {
        text: 'Delivered the platform with Next.js, TypeScript, and Chakra UI; state in Zustand, auth via NextAuth.js.',
      },
    ],
    stack: ['Next.js', 'TypeScript', 'Chakra UI', 'TanStack Query', 'Zustand', 'NextAuth.js'].map(
      (name) => ({ name }),
    ),
    order: 4,
  },
  {
    company: 'Gaspack',
    role: 'Software Engineer — Front End',
    employmentType: 'Full-time',
    location: 'Jakarta, Indonesia (Remote)',
    period: 'Jul 2022 — Oct 2023',
    description:
      'Front-end engineer for client web platforms and Web3 products — NFT minting, marketplace, and staking experiences.',
    highlights: [
      {
        text: 'Developed scalable, responsive platforms with Next.js and TypeScript in close collaboration with UI/UX designers.',
      },
      {
        text: 'Built dApp features for EVM smart-contract interactions used by NFT collections — minting, marketplace, crafting, and staking.',
      },
    ],
    stack: [
      'Next.js',
      'TypeScript',
      'Wagmi',
      'Viem',
      'Ethers.js',
      'Chakra UI',
      'Tailwind CSS',
      'Zustand',
      'SWR',
    ].map((name) => ({ name })),
    order: 5,
  },
  {
    company: 'Garena',
    role: 'Software Engineer Intern — Front End',
    employmentType: 'Internship',
    location: 'Jakarta, Indonesia (Hybrid)',
    period: 'Apr 2021 — Jul 2022',
    description:
      'Internship building gamified web experiences for Garena game events — landing pages, gacha mechanics, voting flows, and card-collection systems.',
    highlights: [
      {
        text: 'Shipped event mini-apps for titles including Call of Duty Mobile, Free Fire, Arena of Valor, Fantasy Town, and FairyTail Mobile.',
      },
    ],
    stack: ['React.js', 'Redux', 'Sass', 'Directus'].map((name) => ({ name })),
    order: 6,
  },
]
