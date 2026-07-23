import type { Author, PaginatedResponse } from '../lib/api-types';

export const authors: PaginatedResponse<Author> = {
  docs: [
    {
      id: 1,
      name: 'Atha Tharizky',
      initials: 'AT',
      role: 'Full-Stack Engineer · Backend · AI tooling',
      bio: 'I write about backend systems, developer experience, and running software projects with AI agents. Follow along — new posts every other week.',
      avatar: null,
    },
  ],
  totalDocs: 1,
  limit: 10,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
};
