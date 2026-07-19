import { computeCharStats, computeSpeed } from './metrics';
import type { WpmSample } from './types';

/**
 * The typing engine: a pure, deterministic reducer over keyboard input.
 *
 * It owns *what was typed* and *the timing*, never the wall clock — every action
 * that needs "now" receives it as `at` (ms). This keeps the engine fully
 * unit-testable and makes the React store a thin dispatcher.
 *
 * Text model: `input[i]` aligns to `target[i]`.
 *   - a string  → the character the user typed at that slot
 *   - null      → the slot was skipped (the user pressed space mid-word)
 * The cursor is simply `input.length`. Extra letters typed past a word's end
 * (before space) are intentionally ignored, which keeps the cursor aligned to
 * the target and avoids overflow bookkeeping.
 */

export type Phase = 'idle' | 'running' | 'finished';

export interface EngineState {
  phase: Phase;
  target: string;
  input: ReadonlyArray<string | null>;
  startedAt: number | null;
  finishedAt: number | null;
  /** All character keystrokes pressed (excludes backspace). */
  totalKeystrokes: number;
  /** Keystrokes that matched the target at press time. */
  correctKeystrokes: number;
  samples: WpmSample[];
  keyErrors: Record<string, number>;
  /** Internal: errors committed since the last sample, for the chart. */
  errorsSinceSample: number;
}

export type EngineAction =
  | { type: 'RESET'; target: string }
  | { type: 'APPEND_TARGET'; text: string }
  | { type: 'TYPE'; char: string; at: number }
  | { type: 'BACKSPACE' }
  | { type: 'SAMPLE'; at: number }
  | { type: 'FINISH'; at: number };

export function createInitialState(target = ''): EngineState {
  return {
    phase: 'idle',
    target,
    input: [],
    startedAt: null,
    finishedAt: null,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    samples: [],
    keyErrors: {},
    errorsSinceSample: 0,
  };
}

/** Index of the next space at or after `from`, or the target length. */
function nextWordBoundary(target: string, from: number): number {
  const idx = target.indexOf(' ', from);
  return idx === -1 ? target.length : idx;
}

function handleType(
  state: EngineState,
  char: string,
  at: number
): EngineState {
  if (state.phase === 'finished') return state;

  const cursor = state.input.length;

  // Nothing left to type.
  if (cursor >= state.target.length) return state;

  const started = state.phase === 'idle';
  const base: EngineState =
    started || state.startedAt === null
      ? { ...state, phase: 'running', startedAt: at }
      : state;

  const expected = base.target[cursor];

  if (char === ' ') {
    // Space at a real space slot: accept it.
    if (expected === ' ') {
      return {
        ...base,
        input: [...base.input, ' '],
        totalKeystrokes: base.totalKeystrokes + 1,
        correctKeystrokes: base.correctKeystrokes + 1,
      };
    }

    // Space mid-word: jump to the next word, marking the rest skipped.
    if (cursor === 0) return base; // ignore leading space
    const boundary = nextWordBoundary(base.target, cursor);
    const skipped: Array<string | null> = [];
    for (let i = cursor; i < boundary; i++) skipped.push(null);
    if (boundary < base.target.length) skipped.push(' '); // consume the space slot

    return {
      ...base,
      input: [...base.input, ...skipped],
      totalKeystrokes: base.totalKeystrokes + 1,
      // a skip is neither rewarded nor penalized as a keystroke error
    };
  }

  // A letter typed where a space is expected is ignored (must press space).
  if (expected === ' ') return base;

  const isCorrect = char === expected;
  const keyErrors = isCorrect
    ? base.keyErrors
    : { ...base.keyErrors, [expected]: (base.keyErrors[expected] ?? 0) + 1 };

  return {
    ...base,
    input: [...base.input, char],
    totalKeystrokes: base.totalKeystrokes + 1,
    correctKeystrokes: base.correctKeystrokes + (isCorrect ? 1 : 0),
    errorsSinceSample: base.errorsSinceSample + (isCorrect ? 0 : 1),
    keyErrors,
  };
}

function handleSample(state: EngineState, at: number): EngineState {
  if (state.phase !== 'running' || state.startedAt === null) return state;

  const elapsedMs = at - state.startedAt;
  if (elapsedMs <= 0) return state;

  let correctChars = 0;
  let typedChars = 0;
  for (let i = 0; i < state.input.length; i++) {
    const typed = state.input[i];
    if (typed === null) continue;
    typedChars += 1;
    if (typed === state.target[i]) correctChars += 1;
  }

  const { wpm, rawWpm } = computeSpeed({
    correctChars,
    typedChars,
    correctKeystrokes: state.correctKeystrokes,
    totalKeystrokes: state.totalKeystrokes,
    elapsedMs,
  });

  const sample: WpmSample = {
    second: Math.round(elapsedMs / 1000),
    wpm,
    raw: rawWpm,
    errors: state.errorsSinceSample,
  };

  return { ...state, samples: [...state.samples, sample], errorsSinceSample: 0 };
}

export function reduce(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case 'RESET':
      return createInitialState(action.target);

    case 'APPEND_TARGET':
      return { ...state, target: state.target + action.text };

    case 'TYPE':
      return handleType(state, action.char, action.at);

    case 'BACKSPACE': {
      if (state.phase !== 'running' || state.input.length === 0) return state;
      return { ...state, input: state.input.slice(0, -1) };
    }

    case 'SAMPLE':
      return handleSample(state, action.at);

    case 'FINISH':
      if (state.phase === 'finished') return state;
      return { ...state, phase: 'finished', finishedAt: action.at };

    default:
      return state;
  }
}

/** Elapsed ms of an in-progress or finished test (0 before the first keystroke). */
export function elapsedMs(state: EngineState, now: number): number {
  if (state.startedAt === null) return 0;
  const end = state.finishedAt ?? now;
  return Math.max(0, end - state.startedAt);
}

/** True once every target character has been consumed (used by words/quote modes). */
export function isComplete(state: EngineState): boolean {
  return state.target.length > 0 && state.input.length >= state.target.length;
}

export { computeCharStats };
