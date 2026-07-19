import { create } from 'zustand';
import {
  createInitialState,
  isComplete,
  reduce,
  type EngineState,
} from '@/core/engine';
import { computeSpeed } from '@/core/metrics';
import { finalizeResult } from '@/core/result';
import { generateWords, pickQuote } from '@/core/words';
import type { TestConfig, TestResult } from '@/core/types';
import { buildConfig, useSettingsStore } from './useSettingsStore';
import { useStatsStore } from './useStatsStore';

interface LiveMetrics {
  wpm: number;
  raw: number;
  accuracy: number;
}

interface TestState {
  config: TestConfig;
  engine: EngineState;
  quoteSource: string | null;
  result: TestResult | null;
  isPersonalBest: boolean;
  live: LiveMetrics;
  timeLeftMs: number | null;
  lastSampleSecond: number;

  restart: () => void;
  typeChar: (char: string) => void;
  backspace: () => void;
  tick: () => void;
  finish: () => void;
}

const ZERO_LIVE: LiveMetrics = { wpm: 0, raw: 0, accuracy: 100 };

/** Words to pre-generate for a time test, scaled to its duration. */
function timeWordCount(durationMs: number): number {
  return Math.max(40, Math.ceil((durationMs / 60_000) * 220));
}

function buildTarget(config: TestConfig): { target: string; source: string | null } {
  const opts = {
    language: config.language,
    punctuation: config.punctuation,
    numbers: config.numbers,
  };

  switch (config.mode) {
    case 'time':
      return {
        target: generateWords({ ...opts, count: timeWordCount(config.durationMs ?? 30_000) }),
        source: null,
      };
    case 'words':
      return { target: generateWords({ ...opts, count: config.wordCount ?? 50 }), source: null };
    case 'quote': {
      const quote = pickQuote();
      return { target: quote.text, source: quote.source };
    }
    case 'zen':
      return { target: generateWords({ ...opts, count: 80 }), source: null };
    case 'custom': {
      // Collapse newlines/runs of whitespace so pasted, multi-line text stays
      // typable (the engine advances word-by-word on single spaces).
      const text = useSettingsStore.getState().customText.replace(/\s+/g, ' ').trim();
      return {
        target: text || generateWords({ ...opts, count: 30 }),
        source: null,
      };
    }
  }
}

function liveMetrics(engine: EngineState, now: number): LiveMetrics {
  if (engine.startedAt === null) return ZERO_LIVE;
  const elapsed = now - engine.startedAt;
  if (elapsed <= 0) return ZERO_LIVE;

  let correct = 0;
  let typed = 0;
  for (let i = 0; i < engine.input.length; i++) {
    const ch = engine.input[i];
    if (ch === null) continue;
    typed += 1;
    if (ch === engine.target[i]) correct += 1;
  }

  const { wpm, rawWpm, accuracy } = computeSpeed({
    correctChars: correct,
    typedChars: typed,
    correctKeystrokes: engine.correctKeystrokes,
    totalKeystrokes: engine.totalKeystrokes,
    elapsedMs: elapsed,
  });

  return { wpm, raw: rawWpm, accuracy: Math.round(accuracy) };
}

export const useTestStore = create<TestState>((set, get) => ({
  config: buildConfig(useSettingsStore.getState()),
  engine: createInitialState(''),
  quoteSource: null,
  result: null,
  isPersonalBest: false,
  live: ZERO_LIVE,
  timeLeftMs: null,
  lastSampleSecond: 0,

  restart: () => {
    const config = buildConfig(useSettingsStore.getState());
    const { target, source } = buildTarget(config);
    set({
      config,
      engine: createInitialState(target),
      quoteSource: source,
      result: null,
      isPersonalBest: false,
      live: ZERO_LIVE,
      timeLeftMs: config.durationMs,
      lastSampleSecond: 0,
    });
  },

  typeChar: (char) => {
    const state = get();
    if (state.engine.phase === 'finished') return;

    const now = Date.now();
    let engine = reduce(state.engine, { type: 'TYPE', char, at: now });

    // Time mode: keep the buffer ahead of the cursor.
    if (
      state.config.mode === 'time' &&
      engine.input.length > engine.target.length - 24
    ) {
      const more = generateWords({
        language: state.config.language,
        count: 24,
        punctuation: state.config.punctuation,
        numbers: state.config.numbers,
      });
      engine = reduce(engine, { type: 'APPEND_TARGET', text: ` ${more}` });
    }

    set({ engine, live: liveMetrics(engine, now) });

    // Fixed-length modes finish when the target is exhausted.
    if (
      state.config.mode !== 'time' &&
      state.config.mode !== 'zen' &&
      isComplete(engine)
    ) {
      get().finish();
    }
  },

  backspace: () => {
    const engine = reduce(get().engine, { type: 'BACKSPACE' });
    set({ engine });
  },

  tick: () => {
    const state = get();
    const { engine, config } = state;
    if (engine.phase !== 'running' || engine.startedAt === null) return;

    const now = Date.now();
    const elapsed = now - engine.startedAt;
    const second = Math.floor(elapsed / 1000);

    let next = engine;
    if (second > state.lastSampleSecond) {
      next = reduce(engine, { type: 'SAMPLE', at: now });
    }

    const timeLeftMs =
      config.durationMs !== null ? Math.max(0, config.durationMs - elapsed) : null;

    set({
      engine: next,
      lastSampleSecond: second,
      live: liveMetrics(next, now),
      timeLeftMs,
    });

    if (config.durationMs !== null && elapsed >= config.durationMs) {
      get().finish();
    }
  },

  finish: () => {
    const state = get();
    if (state.engine.phase === 'finished') return;

    const now = Date.now();
    const engine = reduce(state.engine, { type: 'FINISH', at: now });
    const result = finalizeResult(engine, state.config, now);
    const { isPersonalBest } = useStatsStore.getState().recordResult(result);

    set({ engine, result, isPersonalBest, live: liveMetrics(engine, now), timeLeftMs: 0 });
  },
}));
