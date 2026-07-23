export const API = import.meta.env.PUBLIC_API_URL || '/api';

/** Backend origin for media file URLs (client-side image src).
 *  Local dev (astro dev): ports differ → need full http://localhost:3000.
 *  Production or build: same origin via nginx → relative /api/media/file/... */
export const API_ORIGIN = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function mediaUrl(field: { url?: string | null } | null | undefined): string | null {
  if (!field?.url) return null;
  return field.url.startsWith('http') ? field.url : `${API_ORIGIN}${field.url}`;
}

const DEFAULT_EMPTY_DOCS = { docs: [] };

export async function safeFetch<T>(path: string): Promise<T & { docs?: unknown[] }> {
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) return DEFAULT_EMPTY_DOCS as T & { docs?: unknown[] };
    return await res.json();
  } catch {
    return DEFAULT_EMPTY_DOCS as T & { docs?: unknown[] };
  }
}
