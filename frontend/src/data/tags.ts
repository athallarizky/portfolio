import type { Tag, PaginatedResponse } from '../lib/api-types';

export const tags: PaginatedResponse<Tag> = {
  docs: [
    { id: 1, name: 'AI', slug: 'ai' },
    { id: 2, name: 'Workflow', slug: 'workflow' },
    { id: 3, name: 'RAG', slug: 'rag' },
    { id: 4, name: 'Go', slug: 'go' },
    { id: 5, name: 'TypeScript', slug: 'typescript' },
    { id: 6, name: 'tRPC', slug: 'trpc' },
    { id: 7, name: 'DX', slug: 'dx' },
    { id: 8, name: 'Postgres', slug: 'postgres' },
    { id: 9, name: 'Testing', slug: 'testing' },
  ],
  totalDocs: 9,
  limit: 10,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
};
