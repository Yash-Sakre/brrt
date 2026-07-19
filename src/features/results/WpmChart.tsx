import { useMemo } from 'react';
import type { WpmSample } from '@/core/types';

interface WpmChartProps {
  samples: WpmSample[];
}

const W = 720;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

/** Lightweight, dependency-free SVG line chart of per-second wpm / raw. */
export function WpmChart({ samples }: WpmChartProps) {
  const chart = useMemo(() => {
    if (samples.length < 2) return null;

    const maxRaw = Math.max(...samples.map((s) => Math.max(s.wpm, s.raw)), 10);
    const maxY = Math.ceil(maxRaw / 20) * 20;
    const maxX = samples[samples.length - 1].second || 1;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const x = (sec: number) => PAD.left + (sec / maxX) * innerW;
    const y = (val: number) => PAD.top + innerH - (val / maxY) * innerH;

    const toPath = (key: 'wpm' | 'raw') =>
      samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${x(s.second)} ${y(s[key])}`).join(' ');

    const errorPoints = samples
      .filter((s) => s.errors > 0)
      .map((s) => ({ cx: x(s.second), cy: y(s.raw) }));

    const yTicks = [0, maxY / 2, maxY];

    return {
      wpmPath: toPath('wpm'),
      rawPath: toPath('raw'),
      errorPoints,
      yTicks: yTicks.map((v) => ({ v, y: y(v) })),
      xLabels: [
        { label: '0s', x: x(0) },
        { label: `${maxX}s`, x: x(maxX) },
      ],
    };
  }, [samples]);

  if (!chart) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Not enough data to chart this run.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="WPM over time">
      {chart.yTicks.map((t) => (
        <g key={t.v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={t.y}
            y2={t.y}
            className="stroke-border"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={t.y + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            {Math.round(t.v)}
          </text>
        </g>
      ))}

      {chart.xLabels.map((l) => (
        <text
          key={l.label}
          x={l.x}
          y={H - 8}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          {l.label}
        </text>
      ))}

      <path
        d={chart.rawPath}
        fill="none"
        className="stroke-untyped"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d={chart.wpmPath}
        fill="none"
        className="stroke-primary"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {chart.errorPoints.map((p, i) => (
        <path
          key={i}
          d={`M ${p.cx - 3} ${p.cy - 3} L ${p.cx + 3} ${p.cy + 3} M ${p.cx + 3} ${p.cy - 3} L ${p.cx - 3} ${p.cy + 3}`}
          className="stroke-incorrect"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}
