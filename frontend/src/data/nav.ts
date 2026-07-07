import type { Nav } from '../lib/api-types';

export const nav: Nav = {
  menuItems: [
    { label: 'Home', href: '/', icon: 'solar:user-id-outline', order: 1 },
    { label: 'Projects', href: '/projects', icon: 'solar:widget-5-bold-duotone', order: 2 },
    { label: 'Blogs', href: '/blogs', icon: 'solar:document-text-outline', order: 3 },
    { label: 'Documents', href: '/documents', icon: 'solar:folder-bold-duotone', order: 4 },
    { label: 'Socials', href: '/social', icon: 'solar:users-group-rounded-bold-duotone', order: 5 },
  ],
  connectLinks: [
    { label: 'GitHub', href: 'https://github.com', icon: 'mdi:github', order: 1 },
    { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'mdi:linkedin', order: 2 },
    { label: 'Contact', href: 'mailto:hello@example.com', icon: 'solar:letter-outline', order: 3 },
  ],
};
