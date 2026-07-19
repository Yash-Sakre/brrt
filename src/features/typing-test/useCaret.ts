import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Rows of text kept on screen. */
export const VISIBLE_LINES = 3;
/** Row (0-based) the active line settles on once the text starts scrolling. */
const ACTIVE_ROW = 1;
/** Idle gap after which a resting caret starts blinking again. */
const BLINK_AFTER_MS = 700;

export interface CaretBox {
  /** Left edge, in viewport px. */
  x: number;
  /** Line-box top, in viewport px — the scroll offset is already folded in. */
  y: number;
  /** Advance width of the character under the caret. */
  width: number;
  /** Height of the line box the caret sits on. */
  height: number;
  /** Take this position instantly instead of gliding to it. */
  snap: boolean;
}

interface Options {
  /** Index of the character the caret sits in front of. */
  cursor: number;
  target: string;
  /** True once the cursor has run past the last character. */
  atEnd: boolean;
  /** A fresh, untouched test — the caret should appear at home, not fly there. */
  fresh: boolean;
}

/**
 * Tracks the caret's on-screen box and the text's scroll offset.
 *
 * Positions come out in *viewport* coordinates (relative to the clipping box),
 * not content coordinates, so the caret can live outside the scrolling text and
 * land on its final spot the instant a line wraps while the words glide up
 * behind it.
 */
export function useCaret({ cursor, target, atEnd, fresh }: Options) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const prevRef = useRef<CaretBox | null>(null);
  const offsetRef = useRef(0);

  const [caret, setCaret] = useState<CaretBox | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [blinking, setBlinking] = useState(true);
  // Bumped when the viewport resizes, since that rewraps every line.
  const [reflow, setReflow] = useState(0);

  /**
   * Stable so `Word` stays memoized — a fresh closure per render would re-render
   * every word (and every character span) on each keystroke.
   */
  const activeCharCallback = useCallback((el: HTMLSpanElement | null) => {
    activeCharRef.current = el;
  }, []);

  useLayoutEffect(() => {
    const node = activeCharRef.current;
    const scroll = scrollRef.current;
    if (!node || !scroll) return;

    const charRect = node.getBoundingClientRect();
    // A word is a block-level flex item, so the character's parent box *is* the
    // line box: exact height and top. The character's own box only spans the
    // font's content area, which is shorter and varies by font.
    const lineRect = (node.parentElement ?? node).getBoundingClientRect();
    const scrollRect = scroll.getBoundingClientRect();

    // Measured in content coordinates: the character and the scroll container
    // share the same (animated) translate, so their delta is transform-invariant
    // and safe to read while the scroll transition is still mid-flight.
    const height = lineRect.height || charRect.height;
    const lineTop = lineRect.top - scrollRect.top;
    const line = height > 0 ? Math.round(lineTop / height) : 0;

    // Hold the active line on ACTIVE_ROW; the lines above it need no scrolling.
    const offset = Math.max(0, (line - ACTIVE_ROW) * height);

    const prev = prevRef.current;
    const y = lineTop - offset;
    const next: CaretBox = {
      // The scroll container only translates on Y, so its left edge doubles as
      // the viewport's.
      x: charRect.left - scrollRect.left + (atEnd ? charRect.width : 0),
      y,
      width: charRect.width,
      height,
      // Glide along a line, jump between them: a caret easing diagonally across
      // the full width on every wrap reads as a glitch rather than as motion.
      snap: fresh || prev === null || Math.abs(y - prev.y) > 0.5,
    };

    prevRef.current = next;
    setCaret(next);

    if (Math.abs(offset - offsetRef.current) > 0.5) {
      offsetRef.current = offset;
      setOffsetY(offset);
    }
  }, [cursor, target, atEnd, fresh, reflow]);

  // Hold the caret solid while keys are landing, then let it blink once the
  // typist pauses — a blink mid-glide strobes the moving bar.
  useEffect(() => {
    setBlinking(false);
    const id = window.setTimeout(() => setBlinking(true), BLINK_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [cursor, target]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setReflow((n) => n + 1));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return {
    viewportRef,
    scrollRef,
    activeCharRef: activeCharCallback,
    caret,
    offsetY,
    blinking,
  };
}
