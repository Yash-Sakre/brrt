import type { Language, TestMode } from '@/core/types';

/** Selectable durations for `time` mode (seconds). */
export const TIME_PRESETS = [15, 30, 60, 120] as const;

/** Selectable word counts for `words` mode. */
export const WORD_PRESETS = [10, 25, 50, 100] as const;

export const MODES: { id: TestMode; label: string }[] = [
  { id: 'time', label: 'time' },
  { id: 'words', label: 'words' },
  { id: 'quote', label: 'quote' },
  { id: 'zen', label: 'zen' },
  { id: 'custom', label: 'custom' },
];

export const LANGUAGES: Language[] = ['english', 'english-1k', 'code'];

export const DEFAULT_DURATION_S = 30;
export const DEFAULT_WORD_COUNT = 50;
