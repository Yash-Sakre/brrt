/**
 * Storage abstraction. The app persists to localStorage today, but everything
 * goes through this port so a remote backend (accounts, cloud sync) can be
 * dropped in later without touching the stores.
 */
export interface StoragePort {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const PREFIX = 'type-arena:';

export const localStorageAdapter: StoragePort = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Quota errors or private-mode restrictions are non-fatal.
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};

/** In-memory adapter, primarily for tests and SSR-safe fallbacks. */
export function createMemoryAdapter(): StoragePort {
  const store = new Map<string, string>();
  return {
    get<T>(key: string): T | null {
      const raw = store.get(key);
      return raw === undefined ? null : (JSON.parse(raw) as T);
    },
    set<T>(key: string, value: T): void {
      store.set(key, JSON.stringify(value));
    },
    remove(key: string): void {
      store.delete(key);
    },
  };
}
