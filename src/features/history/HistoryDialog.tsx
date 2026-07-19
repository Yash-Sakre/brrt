import { Flame, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStatsStore } from '@/stores/useStatsStore';
import { useUiStore } from '@/stores/useUiStore';

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(ts);
}

export function HistoryDialog() {
  const overlay = useUiStore((s) => s.overlay);
  const close = useUiStore((s) => s.close);
  const results = useStatsStore((s) => s.results);
  const bests = useStatsStore((s) => s.bests);
  const currentStreak = useStatsStore((s) => s.currentStreak);
  const longestStreak = useStatsStore((s) => s.longestStreak);
  const clearHistory = useStatsStore((s) => s.clearHistory);

  const bestEntries = Object.entries(bests).sort((a, b) => b[1] - a[1]);

  return (
    <Dialog open={overlay === 'history'} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>History</DialogTitle>
          <DialogDescription>Your recent tests and personal bests.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Tests</p>
            <p className="font-mono text-xl">{results.length}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="size-3 text-primary" /> Streak
            </p>
            <p className="font-mono text-xl">{currentStreak}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Longest</p>
            <p className="font-mono text-xl">{longestStreak}</p>
          </div>
        </div>

        {bestEntries.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Personal bests
            </h4>
            <div className="flex flex-wrap gap-2">
              {bestEntries.map(([key, wpm]) => (
                <span
                  key={key}
                  className="rounded-lg bg-secondary/50 px-2.5 py-1 text-sm"
                >
                  <span className="text-muted-foreground">{key.replace('-', ' ')}</span>{' '}
                  <span className="font-mono text-primary">{wpm}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent
          </h4>
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tests yet. Finish a run to see it here.
            </p>
          ) : (
            <div className="flex flex-col">
              {results.slice(0, 30).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between border-b border-foreground/5 py-2 font-mono text-sm last:border-0"
                >
                  <span className="text-muted-foreground">{formatDate(r.timestamp)}</span>
                  <span className="text-muted-foreground">{r.modeKey.replace('-', ' ')}</span>
                  <span>
                    <span className="text-primary">{r.wpm}</span>
                    <span className="text-muted-foreground"> wpm</span>
                  </span>
                  <span className="text-muted-foreground">{Math.round(r.accuracy)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="self-end text-muted-foreground hover:text-destructive"
            onClick={clearHistory}
          >
            <Trash2 className="size-4" /> Clear history
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
