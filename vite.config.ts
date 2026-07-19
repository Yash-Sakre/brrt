import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves a project site under /<repo>/, so built asset URLs
  // need that prefix. We read it from GITHUB_REPOSITORY ("owner/repo") inside
  // GitHub Actions only — every other target (Vercel, dev, local builds)
  // serves from the domain root, so they stay at /.
  base:
    command === 'build' && process.env.GITHUB_ACTIONS === 'true'
      ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''}/`
      : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
