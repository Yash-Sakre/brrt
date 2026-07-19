import type { Language } from './types';
import { getWordPool, QUOTES } from './wordlists';

export interface GenerateOptions {
  language: Language;
  count: number;
  punctuation: boolean;
  numbers: boolean;
  /** Injectable RNG for deterministic tests; defaults to Math.random. */
  rng?: () => number;
}

const pick = <T>(arr: T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)];

const SENTENCE_END = ['.', '.', '.', '!', '?'];
const MID_PUNCT = [',', ';', ':'];

/** Capitalize the first character of a word. */
const capitalize = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Build a space-joined string of `count` words for the given language, applying
 * optional punctuation and numbers. Pure given an `rng`.
 */
export function generateWords(options: GenerateOptions): string {
  const { language, count, punctuation, numbers, rng = Math.random } = options;
  const pool = getWordPool(language);
  const words: string[] = [];

  let capitalizeNext = punctuation; // start sentences capitalized

  for (let i = 0; i < count; i++) {
    let word: string;

    if (numbers && rng() < 0.12) {
      word = String(Math.floor(rng() * 9999));
    } else {
      word = pick(pool, rng);
    }

    if (punctuation) {
      if (capitalizeNext) {
        word = capitalize(word);
        capitalizeNext = false;
      }

      // Occasional mid-sentence punctuation.
      if (rng() < 0.08 && i < count - 1) {
        word += pick(MID_PUNCT, rng);
      } else if (rng() < 0.12 && i < count - 1) {
        word += pick(SENTENCE_END, rng);
        capitalizeNext = true;
      }
    }

    words.push(word);
  }

  return words.join(' ');
}

/** Pick a random quote, returning its text and source. */
export function pickQuote(rng: () => number = Math.random) {
  return QUOTES[Math.floor(rng() * QUOTES.length)];
}
