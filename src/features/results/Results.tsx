import { useRef, useState } from 'react';
import { Download, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadNodeAsImage } from '@/lib/share';
import { useTestStore } from '@/stores/useTestStore';
import { WpmChart } from './WpmChart';
import { KeyboardHeatmap } from './KeyboardHeatmap';

function Stat({
  label,
  value,
  sub,
  large,
}: {
  label: string;
  value: string | number;
  sub?: string;
  large?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono tabular-nums text-primary',
          large ? 'text-5xl sm:text-6xl' : 'text-2xl'
        )}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function Results() {
  const result = useTestStore((s) => s.result);
  const isPersonalBest = useTestStore((s) => s.isPersonalBest);
  const quoteSource = useTestStore((s) => s.quoteSource);
  const restart = useTestStore((s) => s.restart);
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  if (!result) return null;

  const { chars } = result;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      await downloadNodeAsImage(cardRef.current, `brrt-${result.wpm}wpm.png`);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 animate-fade-in">
      <Card ref={cardRef} className="flex flex-col gap-6 p-6 sm:p-8">
        {isPersonalBest && (
          <div className="flex items-center gap-2 self-start rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
            <Trophy className="size-4" /> New personal best!
          </div>
        )}

        <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
          <Stat label="wpm" value={result.wpm} large />
          <Stat label="accuracy" value={`${Math.round(result.accuracy)}%`} large />
        </div>

        <div className="rounded-xl bg-background/40 p-3 ring-1 ring-white/[0.04]">
          <WpmChart samples={result.samples} />
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          <Stat label="raw" value={result.rawWpm} />
          <Stat label="consistency" value={`${Math.round(result.consistency)}%`} />
          <Stat label="cpm" value={result.cpm} />
          <Stat
            label="characters"
            value={`${chars.correct}/${chars.incorrect}/${chars.skipped}/${chars.missed}`}
            sub="correct / wrong / skipped / missed"
          />
          <Stat
            label="mode"
            value={result.modeKey.replace('-', ' ')}
            sub={quoteSource ? `— ${quoteSource}` : result.language}
          />
          <Stat label="time" value={`${(result.durationMs / 1000).toFixed(1)}s`} />
        </div>

        {Object.keys(result.keyErrors).length > 0 && (
          <div className="flex flex-col gap-2 border-t border-foreground/5 pt-5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Trouble keys
            </span>
            <KeyboardHeatmap keyErrors={result.keyErrors} />
          </div>
        )}
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Button onClick={() => restart()} className="gap-2">
          <RotateCcw className="size-4" /> Next test
        </Button>
        <Button variant="outline" onClick={handleShare} disabled={sharing} className="gap-2">
          <Download className="size-4" /> {sharing ? 'Saving…' : 'Save image'}
        </Button>
      </div>
    </div>
  );
}
