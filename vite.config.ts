import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves a project site under /<repo>/, so built asset URLs
  // need that prefix. In CI we read it from GITHUB_REPOSITORY ("owner/repo")
  // so renaming the repo needs no config change; local builds fall back to the
  // current name. Dev stays at / so `pnpm dev` is still just localhost:5173.
  base:
    command === 'build'
      ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'brrt'}/`
      : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
