import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Logo } from '@/components/Logo';
import { useUiStore } from '@/stores/useUiStore';

const SHORTCUTS: [string, string][] = [
  ['esc  /  tab', 'restart the test'],
  ['⌘K  /  Ctrl K', 'open the command palette'],
  ['enter', 'finish a zen test'],
];

export function AboutDialog() {
  const overlay = useUiStore((s) => s.overlay);
  const close = useUiStore((s) => s.close);

  return (
    <Dialog open={overlay === 'about'} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <Logo />
          <DialogTitle className="pt-2">A fast, minimal typing test</DialogTitle>
          <DialogDescription>
            Measure your speed and accuracy across multiple modes. Everything runs locally in
            your browser — your stats never leave your device.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Shortcuts
          </h4>
          {SHORTCUTS.map(([keys, desc]) => (
            <div key={keys} className="flex items-center justify-between text-sm">
              <kbd className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground ring-1 ring-white/[0.04]">
                {keys}
              </kbd>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
