const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://marrymegreece.replit.app';

let isOnline = true;

export function getConnectionStatus(): boolean {
  return isOnline;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  isOnline = true;
  return json.data;
}

export async function withFallback<T>(apiFn: () => Promise<T>, seedData: T): Promise<T> {
  try {
    const result = await apiFn();
    isOnline = true;
    return result;
  } catch {
    console.warn('API offline, using seed data');
    isOnline = false;
    return seedData;
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/api/metrics/server`, { method: 'GET' });
    isOnline = true;
    return true;
  } catch {
    isOnline = false;
    return false;
  }
}
