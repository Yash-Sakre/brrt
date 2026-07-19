import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTestStore } from '@/stores/useTestStore';
import { LiveStats } from './LiveStats';
import { TestConfigBar } from './TestConfigBar';
import { TypingArea } from './TypingArea';

export function TypingTest() {
  const restart = useTestStore((s) => s.restart);

  // Regenerate the test whenever any config input changes (and on mount).
  const mode = useSettingsStore((s) => s.mode);
  const language = useSettingsStore((s) => s.language);
  const durationS = useSettingsStore((s) => s.durationS);
  const wordCount = useSettingsStore((s) => s.wordCount);
  const punctuation = useSettingsStore((s) => s.punctuation);
  const numbers = useSettingsStore((s) => s.numbers);
  const customText = useSettingsStore((s) => s.customText);

  useEffect(() => {
    restart();
  }, [restart, mode, language, durationS, wordCount, punctuation, numbers, customText]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <TestConfigBar />

      <div className="flex w-full max-w-4xl flex-col gap-3">
        <LiveStats />
        <TypingArea />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Restart test"
            onClick={() => restart()}
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Restart  ·  esc</TooltipContent>
      </Tooltip>
    </div>
  );
}
