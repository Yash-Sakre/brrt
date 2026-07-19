import type { CharStats, WpmSample } from './types';

/** A "word" is normalized to 5 characters, the standard typing-test convention. */
const CHARS_PER_WORD = 5;

export interface RawMetricsInput {
  correctChars: number;
  /** Total characters typed that count toward raw speed (correct + incorrect). */
  typedChars: number;
  /** Keystrokes that matched their target the moment they were pressed. */
  correctKeystrokes: number;
  /** All character keystrokes (excludes backspace). */
  totalKeystrokes: number;
  elapsedMs: number;
}

export interface SpeedMetrics {
  wpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
}

const toMinutes = (ms: number) => ms / 60_000;

/** Net WPM counts only correct characters; raw WPM counts everything typed. */
export function computeSpeed(input: RawMetricsInput): SpeedMetrics {
  // Accuracy is independent of elapsed time.
  const accuracy = clampPercent(
    input.totalKeystrokes > 0
      ? (input.correctKeystrokes / input.totalKeystrokes) * 100
      : 0
  );

  const minutes = toMinutes(input.elapsedMs);
  if (minutes <= 0) {
    return { wpm: 0, rawWpm: 0, cpm: 0, accuracy };
  }

  const wpm = Math.round(input.correctChars / CHARS_PER_WORD / minutes);
  const rawWpm = Math.round(input.typedChars / CHARS_PER_WORD / minutes);
  const cpm = Math.round(input.correctChars / minutes);

  return {
    wpm: Math.max(0, wpm),
    rawWpm: Math.max(0, rawWpm),
    cpm: Math.max(0, cpm),
    accuracy,
  };
}

export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Consistency is derived from the coefficient of variation of per-second raw
 * speed: steady typing → high consistency. Returns 0–100.
 */
export function computeConsistency(samples: WpmSample[]): number {
  const values = samples.map((s) => s.raw).filter((v) => v > 0);
  if (values.length < 2) return values.length === 1 ? 100 : 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  if (mean === 0) return 0;

  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  return clampPercent(100 * (1 - cv));
}

/**
 * Tally final character outcomes by comparing the typed input (null = skipped)
 * against the target. `missed` counts target characters never reached.
 */
export function computeCharStats(
  target: string,
  input: ReadonlyArray<string | null>
): CharStats {
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  for (let i = 0; i < input.length; i++) {
    const typed = input[i];
    if (typed === null) {
      skipped += 1;
    } else if (typed === target[i]) {
      correct += 1;
    } else {
      incorrect += 1;
    }
  }

  return {
    correct,
    incorrect,
    skipped,
    missed: Math.max(0, target.length - input.length),
  };
}
