import type { DocumentCategory, PaginatedResponse } from '../lib/api-types';

export const documentCategories: PaginatedResponse<DocumentCategory> = {
  docs: [
    { id: 1, label: 'Pinned', slug: 'pinned', icon: 'solar:pin-bold-duotone', hint: 'The essentials — résumé, CV, cover letter.', order: 1, updatedAt: '2026-07-07T00:00:00.000Z', createdAt: '2026-07-07T00:00:00.000Z' },
    { id: 2, label: 'Research', slug: 'research', icon: 'solar:book-2-outline', hint: 'Write-ups, templates, and notes I keep returning to.', order: 2, updatedAt: '2026-07-07T00:00:00.000Z', createdAt: '2026-07-07T00:00:00.000Z' },
    { id: 3, label: 'Other', slug: 'other', icon: 'solar:folder-2-outline', hint: 'Miscellaneous files and references.', order: 3, updatedAt: '2026-07-07T00:00:00.000Z', createdAt: '2026-07-07T00:00:00.000Z' },
  ],
  totalDocs: 3,
  limit: 10,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
};
