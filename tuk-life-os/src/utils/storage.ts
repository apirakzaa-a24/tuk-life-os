export type ModuleKey = 'timeline' | 'health' | 'finance' | 'vehicles' | 'work' | 'lifeVault' | 'calendar' | 'settings';

const PREFIX = 'tuk-life-os-v1:';

export function readStore<T>(key: ModuleKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: ModuleKey, value: T) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function exportAll() {
  const data: Record<string, unknown> = {};
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(PREFIX)) data[key.replace(PREFIX, '')] = JSON.parse(localStorage.getItem(key) || 'null');
  });
  return data;
}

export function importAll(data: Record<string, unknown>) {
  Object.entries(data).forEach(([key, value]) => localStorage.setItem(PREFIX + key, JSON.stringify(value)));
}
