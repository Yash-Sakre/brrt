/**
 * Core domain types for the typing engine.
 *
 * Everything in `src/core` is framework-agnostic, side-effect-free, and
 * unit-testable. The React layer (stores + components) is a thin binding on top.
 */

export type TestMode = 'time' | 'words' | 'quote' | 'zen' | 'custom';

export type Language = 'english' | 'english-1k' | 'code';

/** A fully resolved description of the test to run. */
export interface TestConfig {
  mode: TestMode;
  language: Language;
  /** Milliseconds for `time` mode, otherwise null. */
  durationMs: number | null;
  /** Target word count for `words` mode, otherwise null. */
  wordCount: number | null;
  punctuation: boolean;
  numbers: boolean;
}

/** Status of a single character slot in the rendered test text. */
export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'skipped';

/** A point sampled (roughly once per second) for the results chart. */
export interface WpmSample {
  /** Whole seconds elapsed since the first keystroke. */
  second: number;
  wpm: number;
  raw: number;
  /** Errors committed during this second. */
  errors: number;
}

export interface CharStats {
  correct: number;
  incorrect: number;
  /** Characters in the target that were skipped (jumped past with space). */
  skipped: number;
  /** Target characters never reached (e.g. time ran out). */
  missed: number;
}

/** The immutable record of one completed test. */
export interface TestResult {
  id: string;
  timestamp: number;
  mode: TestMode;
  language: Language;
  /** Mode descriptor for grouping personal bests, e.g. "time-30" or "words-50". */
  modeKey: string;
  wpm: number;
  rawWpm: number;
  /** 0–100. */
  accuracy: number;
  cpm: number;
  /** 0–100, derived from the variance of per-second raw wpm. */
  consistency: number;
  durationMs: number;
  chars: CharStats;
  samples: WpmSample[];
  /** Per-key error tally for the keyboard heatmap. */
  keyErrors: Record<string, number>;
}
