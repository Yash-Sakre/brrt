import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, TestConfig, TestMode } from '@/core/types';
import { DEFAULT_THEME_ID } from '@/config/themes';
import { DEFAULT_DURATION_S, DEFAULT_WORD_COUNT } from '@/config/presets';
import { portStorage } from './persist';

export type CaretStyle = 'line' | 'block' | 'underline';

interface SettingsState {
  // Test configuration
  mode: TestMode;
  language: Language;
  durationS: number;
  wordCount: number;
  punctuation: boolean;
  numbers: boolean;
  customText: string;

  // Appearance & behavior
  themeId: string;
  sound: boolean;
  smoothCaret: boolean;
  caretStyle: CaretStyle;

  // Actions
  setMode: (mode: TestMode) => void;
  setLanguage: (language: Language) => void;
  setDuration: (seconds: number) => void;
  setWordCount: (count: number) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  setCustomText: (text: string) => void;
  setTheme: (themeId: string) => void;
  toggleSound: () => void;
  toggleSmoothCaret: () => void;
  setCaretStyle: (style: CaretStyle) => void;
}

/** Resolve the current settings into a config the engine can run. */
export function buildConfig(s: SettingsState): TestConfig {
  return {
    mode: s.mode,
    language: s.language,
    durationMs: s.mode === 'time' ? s.durationS * 1000 : null,
    wordCount: s.mode === 'words' ? s.wordCount : null,
    punctuation: s.punctuation,
    numbers: s.numbers,
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: 'time',
      language: 'english',
      durationS: DEFAULT_DURATION_S,
      wordCount: DEFAULT_WORD_COUNT,
      punctuation: false,
      numbers: false,
      customText: '',

      themeId: DEFAULT_THEME_ID,
      sound: false,
      smoothCaret: true,
      caretStyle: 'line',

      setMode: (mode) => set({ mode }),
      setLanguage: (language) => set({ language }),
      setDuration: (durationS) => set({ durationS }),
      setWordCount: (wordCount) => set({ wordCount }),
      togglePunctuation: () => set((s) => ({ punctuation: !s.punctuation })),
      toggleNumbers: () => set((s) => ({ numbers: !s.numbers })),
      setCustomText: (customText) => set({ customText }),
      setTheme: (themeId) => set({ themeId }),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleSmoothCaret: () => set((s) => ({ smoothCaret: !s.smoothCaret })),
      setCaretStyle: (caretStyle) => set({ caretStyle }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: portStorage(),
    }
  )
);
