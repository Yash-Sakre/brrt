import { useEffect } from 'react';
import {
  AtSign,
  Clock,
  Hash,
  Info,
  Palette,
  RotateCcw,
  Settings,
  Type,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { MODES, TIME_PRESETS, WORD_PRESETS, LANGUAGES } from '@/config/presets';
import { THEMES } from '@/config/themes';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTestStore } from '@/stores/useTestStore';
import { useUiStore } from '@/stores/useUiStore';

export function CommandPalette() {
  const overlay = useUiStore((s) => s.overlay);
  const open = useUiStore((s) => s.open);
  const close = useUiStore((s) => s.close);
  const toggle = useUiStore((s) => s.toggle);
  const settings = useSettingsStore();

  // Global ⌘K / Ctrl+K shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle('command');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const run = (fn: () => void) => {
    fn();
    close();
  };

  return (
    <CommandDialog open={overlay === 'command'} onOpenChange={(o) => (o ? open('command') : close())}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => useTestStore.getState().restart())}>
            <RotateCcw /> Restart test
          </CommandItem>
          <CommandItem onSelect={() => run(() => open('settings'))}>
            <Settings /> Open settings
          </CommandItem>
          <CommandItem onSelect={() => run(() => open('history'))}>
            <Clock /> View history
          </CommandItem>
          <CommandItem onSelect={() => run(() => open('about'))}>
            <Info /> About brrt
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Mode">
          {MODES.map((m) => (
            <CommandItem key={m.id} onSelect={() => run(() => settings.setMode(m.id))}>
              <Type /> {m.label}
            </CommandItem>
          ))}
          {TIME_PRESETS.map((t) => (
            <CommandItem
              key={`time-${t}`}
              onSelect={() => run(() => {
                settings.setMode('time');
                settings.setDuration(t);
              })}
            >
              <Clock /> time {t}s
            </CommandItem>
          ))}
          {WORD_PRESETS.map((w) => (
            <CommandItem
              key={`words-${w}`}
              onSelect={() => run(() => {
                settings.setMode('words');
                settings.setWordCount(w);
              })}
            >
              <Type /> words {w}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Options">
          <CommandItem onSelect={() => run(settings.togglePunctuation)}>
            <AtSign /> Toggle punctuation
          </CommandItem>
          <CommandItem onSelect={() => run(settings.toggleNumbers)}>
            <Hash /> Toggle numbers
          </CommandItem>
          {LANGUAGES.map((lang) => (
            <CommandItem key={lang} onSelect={() => run(() => settings.setLanguage(lang))}>
              <Type /> language: {lang}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Theme">
          {THEMES.map((theme) => (
            <CommandItem key={theme.id} onSelect={() => run(() => settings.setTheme(theme.id))}>
              <Palette style={{ color: theme.swatches[1] }} /> {theme.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
