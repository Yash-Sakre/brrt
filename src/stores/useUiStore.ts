import { create } from 'zustand';

export type Overlay = 'command' | 'settings' | 'about' | 'history' | null;

interface UiState {
  overlay: Overlay;
  /** True while the typing surface has focus — used to fade chrome (focus mode). */
  typingFocused: boolean;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  toggle: (overlay: Exclude<Overlay, null>) => void;
  setTypingFocused: (focused: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  overlay: null,
  typingFocused: false,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
  toggle: (overlay) => set((s) => ({ overlay: s.overlay === overlay ? null : overlay })),
  setTypingFocused: (typingFocused) => set({ typingFocused }),
}));
