import { useCallback, useEffect, useRef } from 'react';
import { useTestStore } from '@/stores/useTestStore';
import { useUiStore } from '@/stores/useUiStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { playClick } from '@/lib/sound';

/**
 * Drives the live test: a 100ms ticker while running (sampling + countdown) and
 * a single keydown sink so typing works identically on desktop and mobile.
 */
export function useTestController() {
  const phase = useTestStore((s) => s.engine.phase);
  const mode = useTestStore((s) => s.config.mode);
  const sound = useSettingsStore((s) => s.sound);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Tick while running.
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => useTestStore.getState().tick(), 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  // Keep focus on (re)start.
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Refocus the input on any printable key while it's blurred (unless an
  // overlay like the command palette is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useUiStore.getState().overlay !== null) return;
      if (useUiStore.getState().typingFocused) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 || e.key === 'Backspace') focusInput();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusInput]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const { key } = event;

      // Restart shortcuts.
      if (key === 'Escape' || key === 'Tab') {
        event.preventDefault();
        useTestStore.getState().restart();
        focusInput();
        return;
      }

      // Ignore modified chords (let the browser/command palette handle them).
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (key === 'Enter') {
        event.preventDefault();
        if (mode === 'zen') useTestStore.getState().finish();
        return;
      }

      if (key === 'Backspace') {
        event.preventDefault();
        useTestStore.getState().backspace();
        return;
      }

      if (key === ' ') {
        event.preventDefault();
        useTestStore.getState().typeChar(' ');
        if (sound) playClick();
        return;
      }

      // Single printable character.
      if (key.length === 1) {
        event.preventDefault();
        useTestStore.getState().typeChar(key);
        if (sound) playClick();
      }
    },
    [focusInput, mode, sound]
  );

  const onFocus = useCallback(() => useUiStore.getState().setTypingFocused(true), []);
  const onBlur = useCallback(() => useUiStore.getState().setTypingFocused(false), []);

  return { inputRef, handleKeyDown, focusInput, onFocus, onBlur };
}
