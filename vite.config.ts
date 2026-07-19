import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo at /brrt/, so built asset URLs need that
  // prefix. Dev stays at / so `pnpm dev` is still just localhost:5173.
  // Renaming the repo means changing this.
  base: command === 'build' ? '/brrt/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
