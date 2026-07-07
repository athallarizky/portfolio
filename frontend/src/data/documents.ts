import type { Document, PaginatedResponse } from '../lib/api-types';
import { documentCategories } from './document-categories';

const pinned = documentCategories.docs[0];
const research = documentCategories.docs[1];
const other = documentCategories.docs[2];

export const documents: PaginatedResponse<Document> = {
  docs: [
    {
      id: 1, title: 'Résumé', category: pinned,
      excerpt: 'One-page summary of my experience, roles, and the work I have shipped.',
      updated: 'Jul 2026', updatedAt: '2026-07-07T00:00:00.000Z', createdAt: '2026-07-07T00:00:00.000Z',
      url: '/documents/atha-tharizky-resume.pdf', thumbnailURL: null,
      filename: 'atha-tharizky-resume.pdf', mimeType: 'application/pdf', filesize: 188416,
    },
    {
      id: 2, title: 'CV — Detailed', category: pinned,
      excerpt: 'Full chronology: roles, talks, open-source contributions, and side projects.',
      updated: 'Jun 2026', updatedAt: '2026-06-01T00:00:00.000Z', createdAt: '2026-06-01T00:00:00.000Z',
      url: '/documents/atha-tharizky-cv.pdf', thumbnailURL: null,
      filename: 'atha-tharizky-cv.pdf', mimeType: 'application/pdf', filesize: 266240,
    },
    {
      id: 3, title: 'Cover Letter Template', category: pinned,
      excerpt: 'A reusable template I tailor for each role I apply to.',
      updated: 'Apr 2026', updatedAt: '2026-04-01T00:00:00.000Z', createdAt: '2026-04-01T00:00:00.000Z',
      url: '/documents/atha-tharizky-cover-letter.pdf', thumbnailURL: null,
      filename: 'atha-tharizky-cover-letter.pdf', mimeType: 'application/pdf', filesize: 94208,
    },
    {
      id: 4, title: 'AI Workflow Template', category: research,
      excerpt: 'How I run a software project with an AI agent — PRD to production, phase by phase.',
      updated: 'Jul 2026', updatedAt: '2026-07-07T00:00:00.000Z', createdAt: '2026-07-07T00:00:00.000Z',
      url: '/documents/ai-workflow-template.md', thumbnailURL: null,
      filename: 'ai-workflow-template.md', mimeType: 'text/markdown', filesize: 16384,
    },
    {
      id: 5, title: 'Case Study — Rent-House-AI', category: research,
      excerpt: 'Deep dive: listing scraper → RAG pipeline → semantic search across five services.',
      updated: 'May 2026', updatedAt: '2026-05-01T00:00:00.000Z', createdAt: '2026-05-01T00:00:00.000Z',
      url: '/documents/rent-house-ai-case-study.pdf', thumbnailURL: null,
      filename: 'rent-house-ai-case-study.pdf', mimeType: 'application/pdf', filesize: 1258291,
    },
    {
      id: 6, title: 'References', category: other,
      excerpt: 'Contact details for past collaborators and managers — available on request.',
      updated: 'Mar 2026', updatedAt: '2026-03-01T00:00:00.000Z', createdAt: '2026-03-01T00:00:00.000Z',
      url: '/documents/atha-tharizky-references.pdf', thumbnailURL: null,
      filename: 'atha-tharizky-references.pdf', mimeType: 'application/pdf', filesize: 71680,
    },
  ],
  totalDocs: 6,
  limit: 10,
  totalPages: 1,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
};
