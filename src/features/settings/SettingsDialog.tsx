import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { LANGUAGES } from '@/config/presets';
import { THEMES } from '@/config/themes';
import { LANGUAGE_LABELS } from '@/core/wordlists';
import { useSettingsStore, type CaretStyle } from '@/stores/useSettingsStore';
import { useUiStore } from '@/stores/useUiStore';

const CARET_STYLES: CaretStyle[] = ['line', 'block', 'underline'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-secondary/50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
            value === opt
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SettingsDialog() {
  const overlay = useUiStore((s) => s.overlay);
  const close = useUiStore((s) => s.close);
  const s = useSettingsStore();

  return (
    <Dialog open={overlay === 'settings'} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize the look and feel of your tests.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 pt-2">
          <Section title="Theme">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => s.setTheme(theme.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl p-2.5 text-left text-sm transition-all',
                    s.themeId === theme.id
                      ? 'bg-secondary ring-2 ring-primary'
                      : 'bg-secondary/40 hover:bg-secondary'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex -space-x-1">
                      {theme.swatches.map((c, i) => (
                        <span
                          key={i}
                          className="size-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                    {theme.name}
                  </span>
                  {s.themeId === theme.id && <Check className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Language">
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => s.setLanguage(lang)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    s.language === lang
                      ? 'bg-secondary text-primary'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Behavior">
            <Row label="Sound on keypress">
              <Switch checked={s.sound} onCheckedChange={s.toggleSound} />
            </Row>
            <Row label="Smooth caret">
              <Switch checked={s.smoothCaret} onCheckedChange={s.toggleSmoothCaret} />
            </Row>
            <Row label="Caret style">
              <Segmented options={CARET_STYLES} value={s.caretStyle} onChange={s.setCaretStyle} />
            </Row>
          </Section>

          <Section title="Custom text">
            <p className="text-xs text-muted-foreground">
              Used when the <span className="text-foreground">custom</span> mode is selected.
            </p>
            <textarea
              value={s.customText}
              onChange={(e) => s.setCustomText(e.target.value)}
              placeholder="Paste your own text to practice…"
              rows={3}
              className="w-full resize-none rounded-xl bg-secondary/50 px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
