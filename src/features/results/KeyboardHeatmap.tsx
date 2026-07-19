import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

/** Compact QWERTY heatmap tinting the keys you mistyped most. */
export function KeyboardHeatmap({ keyErrors }: { keyErrors: Record<string, number> }) {
  const max = useMemo(
    () => Math.max(1, ...Object.values(keyErrors)),
    [keyErrors]
  );

  if (Object.keys(keyErrors).length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {Array.from(row).map((key) => {
            const errors = keyErrors[key] ?? 0;
            const intensity = errors / max;
            return (
              <span
                key={key}
                title={errors ? `${key}: ${errors} errors` : key}
                className={cn(
                  'flex size-6 items-center justify-center rounded text-[11px] font-medium uppercase sm:size-7',
                  errors === 0 && 'bg-secondary text-muted-foreground'
                )}
                style={
                  errors > 0
                    ? {
                        backgroundColor: `hsl(var(--incorrect) / ${0.2 + intensity * 0.65})`,
                        color: 'hsl(var(--destructive-foreground))',
                      }
                    : undefined
                }
              >
                {key}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
