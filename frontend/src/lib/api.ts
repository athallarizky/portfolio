export const API = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

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
