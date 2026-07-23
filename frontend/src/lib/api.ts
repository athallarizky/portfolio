export const API = import.meta.env.PUBLIC_API_URL || '/api';

/** Backend origin for media file URLs. In dev (PUBLIC_API_URL set), point to backend port.
 *  In production (PUBLIC_API_URL empty), same origin — use empty string so paths stay relative. */
const _apiUrl = import.meta.env.PUBLIC_API_URL;
export const API_ORIGIN = _apiUrl ? _apiUrl.replace(/\/api\/?$/, '') : '';

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
