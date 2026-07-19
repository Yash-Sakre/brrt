import { useTestStore } from '@/stores/useTestStore';

/** Subtle live readout shown above the words while a test is running. */
export function LiveStats() {
  const phase = useTestStore((s) => s.engine.phase);
  const mode = useTestStore((s) => s.config.mode);
  const timeLeftMs = useTestStore((s) => s.timeLeftMs);
  const wpm = useTestStore((s) => s.live.wpm);
  const wordsDone = useTestStore((s) => s.engine.target.slice(0, s.engine.input.length).split(' ').length - 1);
  const wordTotal = useTestStore((s) => s.config.wordCount);

  const running = phase === 'running';

  let primary = '';
  if (mode === 'time') {
    primary = String(Math.ceil((timeLeftMs ?? 0) / 1000));
  } else if (mode === 'words' && wordTotal) {
    primary = `${Math.min(wordsDone, wordTotal)}/${wordTotal}`;
  }

  return (
    <div className="flex h-7 items-center gap-4 font-mono text-primary">
      {primary && <span className="text-2xl tabular-nums">{primary}</span>}
      {running && wpm > 0 && (
        <span className="text-sm text-muted-foreground">{wpm} wpm</span>
      )}
    </div>
  );
}
