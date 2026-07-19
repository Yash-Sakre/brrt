import { Command, Flame, Info, Palette, Settings } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/useUiStore';
import { useStatsStore } from '@/stores/useStatsStore';

interface IconActionProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function IconAction({ label, onClick, children }: IconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick} aria-label={label}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function Header({ dimmed }: { dimmed: boolean }) {
  const open = useUiStore((s) => s.open);
  const streak = useStatsStore((s) => s.currentStreak);

  return (
    <header
      className={cn(
        'flex items-center justify-between transition-opacity duration-300',
        dimmed && 'opacity-30 hover:opacity-100'
      )}
    >
      <Logo />

      <div className="flex items-center gap-1">
        {streak > 0 && (
          <span
            className="mr-1 hidden items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-foreground sm:flex"
            title={`${streak}-day streak`}
          >
            <Flame className="size-3.5 text-primary" />
            {streak}
          </span>
        )}
        <IconAction label="Commands  (⌘K)" onClick={() => open('command')}>
          <Command />
        </IconAction>
        <IconAction label="Themes" onClick={() => open('settings')}>
          <Palette />
        </IconAction>
        <IconAction label="Settings" onClick={() => open('settings')}>
          <Settings />
        </IconAction>
        <IconAction label="About" onClick={() => open('about')}>
          <Info />
        </IconAction>
      </div>
    </header>
  );
}
