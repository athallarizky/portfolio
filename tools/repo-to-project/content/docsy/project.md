# Docsy

## Technical Overview

`docsy` is an enterprise-grade file management system built as a containerized monorepo. It pairs a **Laravel 11 REST API** backend with a **Vue 3 Composition API SPA**, backed by **PostgreSQL 16** for recursive tree operations and full-text search, and **Redis 7** for cache-aside performance and background job processing. The entire stack runs on a single exposed port via an Nginx reverse proxy.

## Technical Architecture & Request Flow

```
                    ┌────────────────────────────────────────────┐
                    │  Nginx Reverse Proxy (:8000)               │
                    │  ├─ /api/*  ──▶ PHP-FPM (Laravel 11 API)   │
                    │  └─ /*      ──▶ Static SPA (Vue 3 Build)   │
                    └──────┬──────────────────────┬──────────────┘
                           │                      │
                  ┌────────▼────────┐    ┌────────▼────────┐
                  │  PostgreSQL 16  │    │     Redis 7     │
                  │  - Recursive CTE│    │  - Cache-aside  │
                  │  - GIN tsvector │    │  - Queue worker │
                  └─────────────────┘    └─────────────────┘
```

1. **Unified Ingress (Nginx):** A single Alpine Nginx container serves production-built Vue 3 static assets directly while reverse-proxying all `/api` requests to PHP 8.3 FPM. This eliminates browser CORS issues entirely in development and production.
2. **Hierarchical Folder Trees (PostgreSQL Recursive CTEs):** Folders support infinite nesting without recursive database calls. A single SQL recursive common table expression (`WITH RECURSIVE`) computes full ancestor breadcrumb paths in one query. Moving a folder runs a circular-move detection check in SQL, rejecting attempts to drop a folder into its own subtree with an HTTP 422.
3. **Full-Text Search Engine:** File search uses PostgreSQL native `tsvector` generated columns coupled with a **GIN (Generalized Inverted Index)**. It provides stemming, multi-word matching (`&`), and ranking without relying on external search daemons like Elasticsearch.
4. **Async Jobs & Cache-Aside (Redis 7):** Dashboard analytics (file counts, storage usage, folder breakdown) use cache-aside caching with TTL and event-driven invalidation on upload/delete. Heavy operations — thumbnail generation via Sharp/GD and audit logging — run asynchronously via Redis queue workers.
5. **Secure Streamed Storage:** Uploads (capped at 25MB with strict MIME validation) are stored on an isolated private disk mapped by UUIDs. File downloads stream binary chunks directly to the HTTP socket, maintaining a flat memory footprint regardless of file size.
