import { AtSign, Hash, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUiStore } from '@/stores/useUiStore';
import {
  MODES,
  TIME_PRESETS,
  WORD_PRESETS,
} from '@/config/presets';

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-2.5 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-secondary text-primary'
          : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-foreground/10" />;
}

export function TestConfigBar() {
  const {
    mode,
    durationS,
    wordCount,
    punctuation,
    numbers,
    setMode,
    setDuration,
    setWordCount,
    togglePunctuation,
    toggleNumbers,
  } = useSettingsStore();

  const openSettings = useUiStore((s) => s.open);
  const showPresets = mode === 'time' || mode === 'words';

  return (
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl bg-card/70 px-2 py-1.5 text-sm shadow-lg shadow-black/20 ring-1 ring-white/[0.05] backdrop-blur-xl">
      <Pill active={punctuation} onClick={togglePunctuation}>
        <span className="flex items-center gap-1">
          <AtSign className="size-3.5" /> punctuation
        </span>
      </Pill>
      <Pill active={numbers} onClick={toggleNumbers}>
        <span className="flex items-center gap-1">
          <Hash className="size-3.5" /> numbers
        </span>
      </Pill>

      <Divider />

      {MODES.map((m) => (
        <Pill key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
          {m.label}
        </Pill>
      ))}

      {showPresets && (
        <>
          <Divider />
          {mode === 'time' &&
            TIME_PRESETS.map((t) => (
              <Pill key={t} active={durationS === t} onClick={() => setDuration(t)}>
                {t}
              </Pill>
            ))}
          {mode === 'words' &&
            WORD_PRESETS.map((w) => (
              <Pill key={w} active={wordCount === w} onClick={() => setWordCount(w)}>
                {w}
              </Pill>
            ))}
        </>
      )}

      {mode === 'custom' && (
        <>
          <Divider />
          <Pill active={false} onClick={() => openSettings('settings')}>
            <span className="flex items-center gap-1">
              <Pencil className="size-3.5" /> edit text
            </span>
          </Pill>
        </>
      )}
    </div>
  );
}
