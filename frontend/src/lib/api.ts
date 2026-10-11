export const API = import.meta.env.PUBLIC_API_URL || '/api';

import { API_ORIGIN, isDev } from './env';
export { API_ORIGIN, isDev };

export function mediaUrl(field: { url?: string | null } | null | undefined): string | null {
  if (!field?.url) return null;
  return field.url.startsWith('http') ? field.url : `${API_ORIGIN}${field.url}`;
}

/** Sprint-28: thumbnail picker — prefer a generated size (R2-backed, absolute URL)
 *  over the flat `thumbnailURL` field, which can carry a malformed host
 *  (`undefined/…`) when uploads ran without PAYLOAD_PUBLIC_SERVER_URL set
 *  (the sprint-27 local imports). Falls back to the full-size URL. */
export function mediaThumbUrl(
  field: {
    url?: string | null;
    sizes?: Record<string, { url?: string | null } | undefined>;
  } | null | undefined,
): string | null {
  const sized = field?.sizes?.thumbnail?.url ?? field?.sizes?.card?.url;
  if (sized) return sized.startsWith('http') ? sized : `${API_ORIGIN}${sized}`;
  return mediaUrl(field);
}

const DEFAULT_EMPTY_DOCS = { docs: [] };

export async function safeFetch<T>(path: string): Promise<T & { docs?: unknown[] }> {
  try {
    const encoded = path.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
    const res = await fetch(`${API}${encoded}`);
    if (!res.ok) return DEFAULT_EMPTY_DOCS as T & { docs?: unknown[] };
    return await res.json();
  } catch {
    return DEFAULT_EMPTY_DOCS as T & { docs?: unknown[] };
  }
}
