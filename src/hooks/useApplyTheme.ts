import { useEffect } from 'react';
import { applyTheme } from '@/config/themes';
import { useSettingsStore } from '@/stores/useSettingsStore';

/** Keeps the document theme in sync with the persisted setting. */
export function useApplyTheme(): void {
  const themeId = useSettingsStore((s) => s.themeId);
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);
}
