import { computeCharStats, elapsedMs, type EngineState } from './engine';
import { computeConsistency, computeSpeed } from './metrics';
import type { TestConfig, TestResult } from './types';

/** Stable key used to group personal bests, e.g. `time-30`, `words-50`, `quote`. */
export function modeKeyFor(config: TestConfig): string {
  switch (config.mode) {
    case 'time':
      return `time-${(config.durationMs ?? 0) / 1000}`;
    case 'words':
      return `words-${config.wordCount ?? 0}`;
    default:
      return config.mode;
  }
}

const randomId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Convert a finished engine state into an immutable TestResult. `now` is the
 * finish timestamp (engine.finishedAt is preferred when present).
 */
export function finalizeResult(
  state: EngineState,
  config: TestConfig,
  now: number
): TestResult {
  const duration = elapsedMs(state, now);

  let correctChars = 0;
  let typedChars = 0;
  for (let i = 0; i < state.input.length; i++) {
    const typed = state.input[i];
    if (typed === null) continue;
    typedChars += 1;
    if (typed === state.target[i]) correctChars += 1;
  }

  const speed = computeSpeed({
    correctChars,
    typedChars,
    correctKeystrokes: state.correctKeystrokes,
    totalKeystrokes: state.totalKeystrokes,
    elapsedMs: duration,
  });

  return {
    id: randomId(),
    timestamp: state.finishedAt ?? now,
    mode: config.mode,
    language: config.language,
    modeKey: modeKeyFor(config),
    wpm: speed.wpm,
    rawWpm: speed.rawWpm,
    accuracy: speed.accuracy,
    cpm: speed.cpm,
    consistency: computeConsistency(state.samples),
    durationMs: duration,
    chars: computeCharStats(state.target, state.input),
    samples: state.samples,
    keyErrors: state.keyErrors,
  };
}
