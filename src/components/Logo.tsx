import { cn } from '@/lib/utils';

/** Speed-streaks racing into a typing caret — the "brrt" of fast keystrokes. */
export function BrrtMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="6.9" width="8" height="2.2" rx="1.1" opacity="0.5" />
      <rect x="1" y="10.9" width="10" height="2.2" rx="1.1" opacity="0.75" />
      <rect x="4" y="14.9" width="7" height="2.2" rx="1.1" opacity="0.5" />
      <rect x="14" y="4" width="2.6" height="16" rx="1.3" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <BrrtMark className="size-5" />
      </span>
      <span className="text-lg font-bold lowercase tracking-tight">
        br<span className="text-primary">rt</span>
      </span>
    </div>
  );
}
