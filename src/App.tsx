import { useApplyTheme } from '@/hooks/useApplyTheme';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TypingTest } from '@/features/typing-test/TypingTest';
import { Results } from '@/features/results/Results';
import { CommandPalette } from '@/features/command/CommandPalette';
import { SettingsDialog } from '@/features/settings/SettingsDialog';
import { AboutDialog } from '@/features/about/AboutDialog';
import { HistoryDialog } from '@/features/history/HistoryDialog';
import { useTestStore } from '@/stores/useTestStore';
import { useUiStore } from '@/stores/useUiStore';

export default function App() {
  useApplyTheme();

  const hasResult = useTestStore((s) => s.result !== null);
  const typingFocused = useUiStore((s) => s.typingFocused);
  const chromeDimmed = typingFocused && !hasResult;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* A single soft ambient glow — depth without a busy backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-[-15%] h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-6">
        <Header dimmed={chromeDimmed} />

        <main className="flex flex-1 flex-col items-center justify-center py-8">
          {hasResult ? <Results /> : <TypingTest />}
        </main>

        <Footer dimmed={chromeDimmed} />
      </div>

      <CommandPalette />
      <SettingsDialog />
      <AboutDialog />
      <HistoryDialog />
    </div>
  );
}
