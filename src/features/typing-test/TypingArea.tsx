import { useMemo } from 'react';
import { useTestStore } from '@/stores/useTestStore';
import { useSettingsStore, type CaretStyle } from '@/stores/useSettingsStore';
import { useUiStore } from '@/stores/useUiStore';
import { cn } from '@/lib/utils';
import { SKIP, Word } from './Word';
import { useCaret, VISIBLE_LINES, type CaretBox } from './useCaret';
import { useTestController } from './useTestController';

interface Token {
  start: number;
  text: string;
}

/** Split target text into word groups (each includes its trailing space). */
function tokenize(target: string): Token[] {
  const tokens: Token[] = [];
  let start = 0;
  for (let i = 0; i < target.length; i++) {
    if (target[i] === ' ') {
      tokens.push({ start, text: target.slice(start, i + 1) });
      start = i + 1;
    }
  }
  if (start < target.length) tokens.push({ start, text: target.slice(start) });
  return tokens;
}

/** Caret geometry for a style, in px, offset from the top of the line box. */
function caretShape(style: CaretStyle, box: CaretBox) {
  switch (style) {
    case 'block':
      return { dy: box.height * 0.08, width: box.width, height: box.height * 0.84 };
    case 'underline':
      return { dy: box.height * 0.82, width: box.width, height: 3 };
    case 'line':
    default:
      // Scale the bar with the text so it stays a hairline at every breakpoint.
      return {
        dy: box.height * 0.1,
        width: Math.max(2, Math.round(box.width * 0.14)),
        height: box.height * 0.8,
      };
  }
}

export function TypingArea() {
  const target = useTestStore((s) => s.engine.target);
  const input = useTestStore((s) => s.engine.input);
  const phase = useTestStore((s) => s.engine.phase);
  const caretStyle = useSettingsStore((s) => s.caretStyle);
  const smoothCaret = useSettingsStore((s) => s.smoothCaret);
  const typingFocused = useUiStore((s) => s.typingFocused);

  const { inputRef, handleKeyDown, focusInput, onFocus, onBlur } = useTestController();

  const cursor = input.length;
  const tokens = useMemo(() => tokenize(target), [target]);

  /** A brand-new test: everything belongs at the origin at once, with no motion. */
  const fresh = phase === 'idle' && cursor === 0;

  const { viewportRef, scrollRef, activeCharRef, caret, offsetY, blinking } = useCaret({
    cursor,
    target,
    atEnd: cursor >= target.length,
    fresh,
  });

  // Find which token holds the caret.
  const activeIndex = useMemo(() => {
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (cursor >= tokens[i].start) return i;
    }
    return 0;
  }, [tokens, cursor]);

  const shape = caret ? caretShape(caretStyle, caret) : null;

  return (
    <div
      className="relative w-full cursor-text"
      onMouseDown={(e) => {
        e.preventDefault();
        focusInput();
      }}
    >
      <textarea
        ref={inputRef}
        className="sr-input"
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label="Typing input"
      />

      {/* Blur veil */}
      {!typingFocused && phase !== 'finished' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="rounded-md bg-background/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            Click or press any key to focus
          </span>
        </div>
      )}

      <div
        ref={viewportRef}
        className={cn(
          'relative overflow-hidden font-mono text-2xl leading-relaxed transition-[filter] sm:text-3xl',
          !typingFocused && phase !== 'finished' && 'blur-[3px]'
        )}
        style={{ height: `${VISIBLE_LINES * 1.625}em` }}
        aria-hidden
      >
        <div
          ref={scrollRef}
          className={cn(
            'relative flex flex-wrap content-start will-change-transform',
            // Restarting replaces the words outright, so the reset to the top
            // should land with them rather than sliding in afterwards.
            !fresh && 'typing-scroll'
          )}
          style={{ transform: `translate3d(0, ${-offsetY}px, 0)` }}
        >
          {tokens.map((token, i) => {
            const slice = input.slice(token.start, token.start + token.text.length);
            const typed = slice.map((c) => (c === null ? SKIP : c)).join('');
            const active = i === activeIndex;
            return (
              <Word
                key={token.start}
                target={token.text}
                typed={typed}
                active={active}
                localCursor={active ? cursor - token.start : -1}
                caretRef={activeCharRef}
              />
            );
          })}
        </div>

        {/* Caret — a sibling of the scrolling text rather than a child of it, so
            a line change puts it straight on its final spot while the words
            glide up behind it. Positions are already viewport-relative. */}
        {caret && shape && (
          <span
            className={cn(
              'pointer-events-none absolute left-0 top-0 z-0 bg-caret will-change-transform',
              smoothCaret && !caret.snap && 'typing-caret-glide',
              blinking && typingFocused && phase !== 'finished' && 'typing-caret-blink',
              caretStyle === 'block' ? 'rounded-sm opacity-40' : 'rounded-full'
            )}
            style={{
              transform: `translate3d(${caret.x}px, ${caret.y + shape.dy}px, 0)`,
              width: shape.width,
              height: shape.height,
            }}
          />
        )}
      </div>
    </div>
  );
}
