import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so a crash shows a recoverable message instead of
 * a blank white page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging; a real app would report this to a service.
    console.error('brrt crashed:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The app hit an unexpected error. Reloading usually fixes it. If it keeps happening,
          resetting saved data will clear any corrupted state.
        </p>
        <pre className="max-w-md overflow-auto rounded-md border border-border bg-card p-3 text-left text-xs text-destructive">
          {error.message}
        </pre>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith('type-arena:'))
                  .forEach((k) => localStorage.removeItem(k));
              } finally {
                window.location.reload();
              }
            }}
          >
            Reset data &amp; reload
          </Button>
        </div>
      </div>
    );
  }
}
