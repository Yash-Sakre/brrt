import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestResult } from '@/core/types';
import { portStorage } from './persist';

const HISTORY_LIMIT = 200;

/** Local-calendar date key, e.g. "2026-06-18". */
function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86_400_000);
}

interface StatsState {
  results: TestResult[];
  bests: Record<string, number>;
  lastTestDay: string | null;
  currentStreak: number;
  longestStreak: number;

  recordResult: (result: TestResult) => { isPersonalBest: boolean };
  clearHistory: () => void;
  bestFor: (modeKey: string) => number;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      results: [],
      bests: {},
      lastTestDay: null,
      currentStreak: 0,
      longestStreak: 0,

      recordResult: (result) => {
        const state = get();
        const prevBest = state.bests[result.modeKey] ?? 0;
        const isPersonalBest = result.wpm > prevBest;

        const today = dayKey(result.timestamp);
        let currentStreak = state.currentStreak;
        if (state.lastTestDay === null) {
          currentStreak = 1;
        } else {
          const gap = daysBetween(state.lastTestDay, today);
          if (gap === 0) currentStreak = Math.max(1, currentStreak);
          else if (gap === 1) currentStreak += 1;
          else currentStreak = 1;
        }

        set({
          results: [result, ...state.results].slice(0, HISTORY_LIMIT),
          bests: isPersonalBest
            ? { ...state.bests, [result.modeKey]: result.wpm }
            : state.bests,
          lastTestDay: today,
          currentStreak,
          longestStreak: Math.max(state.longestStreak, currentStreak),
        });

        return { isPersonalBest };
      },

      clearHistory: () =>
        set({
          results: [],
          bests: {},
          lastTestDay: null,
          currentStreak: 0,
          longestStreak: 0,
        }),

      bestFor: (modeKey) => get().bests[modeKey] ?? 0,
    }),
    {
      name: 'stats',
      version: 1,
      storage: portStorage(),
    }
  )
);
