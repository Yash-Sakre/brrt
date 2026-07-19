import { cn } from '@/lib/utils';

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-white/[0.04]">
      {children}
    </kbd>
  );
}

export function Footer({ dimmed }: { dimmed: boolean }) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground transition-opacity duration-300',
        dimmed && 'opacity-0'
      )}
    >
      <span className="flex items-center gap-1.5">
        <Key>tab</Key> + <Key>enter</Key> restart
      </span>
      <span className="flex items-center gap-1.5">
        <Key>esc</Key> restart
      </span>
      <span className="flex items-center gap-1.5">
        <Key>⌘</Key> <Key>k</Key> commands
      </span>
    </footer>
  );
}
