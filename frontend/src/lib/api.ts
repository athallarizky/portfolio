export const API = import.meta.env.PUBLIC_API_URL || '/api';

import { API_ORIGIN, isDev } from './env';
export { API_ORIGIN, isDev };

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
