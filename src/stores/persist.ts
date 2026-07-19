import type { PersistStorage } from 'zustand/middleware';
import { localStorageAdapter } from '@/core/storage';

/**
 * Bridges zustand's persist middleware to our StoragePort, so all persistence
 * flows through the single IO boundary in `core/storage.ts`. Swap the adapter
 * there (e.g. for a backend) and every store follows.
 */
export function portStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => localStorageAdapter.get(name),
    setItem: (name, value) => localStorageAdapter.set(name, value),
    removeItem: (name) => localStorageAdapter.remove(name),
  };
}
