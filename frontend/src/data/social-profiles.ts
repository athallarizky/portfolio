import type { SocialProfile, PaginatedResponse } from '../lib/api-types';

export const socialProfiles: PaginatedResponse<SocialProfile> = {
  docs: [
    { id: 1, platform: 'GitHub', icon: 'simple-icons:github', handle: '@athatharizky', url: 'https://github.com', showOnHome: true, order: 1 },
    { id: 2, platform: 'LinkedIn', icon: 'simple-icons:linkedin', handle: '@athatharizky', url: 'https://www.linkedin.com', showOnHome: true, order: 2 },
    { id: 3, platform: 'X', icon: 'simple-icons:x', handle: '@athatharizky', url: 'https://x.com', showOnHome: true, order: 3 },
    { id: 4, platform: 'Threads', icon: 'simple-icons:threads', handle: '@athatharizky', url: 'https://threads.net', showOnHome: true, order: 4 },
    { id: 5, platform: 'Instagram', icon: 'simple-icons:instagram', handle: '@athatharizky', url: 'https://instagram.com', showOnHome: false, order: 5 },
    { id: 6, platform: 'Facebook', icon: 'simple-icons:facebook', handle: '@athatharizky', url: 'https://facebook.com', showOnHome: false, order: 6 },
    { id: 7, platform: 'YouTube', icon: 'simple-icons:youtube', handle: '@athatharizky', url: 'https://youtube.com', showOnHome: false, order: 7 },
  ],
  totalDocs: 7,
  limit: 10,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
};
