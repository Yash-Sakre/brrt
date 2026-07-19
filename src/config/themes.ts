/**
 * Theme registry. Each theme's CSS custom properties live in `index.css` under
 * a `[data-theme="id"]` selector; this file holds only the metadata and preview
 * swatches the UI needs (theme gallery, command palette).
 */
export interface Theme {
  id: string;
  name: string;
  dark: boolean;
  /** Preview swatches: [background, primary, text]. */
  swatches: [string, string, string];
}

export const THEMES: Theme[] = [
  { id: 'arena-dark', name: 'Arena Dark', dark: true, swatches: ['#0d1322', '#a78bfa', '#e8eef7'] },
  { id: 'arena-light', name: 'Arena Light', dark: false, swatches: ['#f6f1e7', '#6d3fd4', '#1b2433'] },
  { id: 'midnight', name: 'Midnight', dark: true, swatches: ['#0b0f1a', '#7c93ff', '#dbe2f5'] },
  { id: 'matcha', name: 'Matcha', dark: true, swatches: ['#11201a', '#6fe3a1', '#e3f3ea'] },
  { id: 'ember', name: 'Ember', dark: true, swatches: ['#1a0f0c', '#ff8a5c', '#f6e6dd'] },
  { id: 'paper', name: 'Paper', dark: false, swatches: ['#faf8f3', '#b4632a', '#2a2620'] },
];

export const DEFAULT_THEME_ID = 'arena-dark';

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Apply a theme by setting the data attribute the CSS keys off of. */
export function applyTheme(id: string): void {
  const theme = getTheme(id);
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.classList.toggle('dark', theme.dark);
  root.style.colorScheme = theme.dark ? 'dark' : 'light';
}
