import type { Language } from '../types';
import { ENGLISH } from './english';
import { EXTENDED } from './extended';
import { CODE } from './code';

export { QUOTES } from './quotes';
export type { Quote } from './quotes';

/** The pool of words available for each language. */
export const WORD_POOLS: Record<Language, string[]> = {
  english: ENGLISH,
  'english-1k': [...ENGLISH, ...EXTENDED],
  code: CODE,
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  english: 'english',
  'english-1k': 'english 1k',
  code: 'code',
};

export function getWordPool(language: Language): string[] {
  return WORD_POOLS[language] ?? ENGLISH;
}
