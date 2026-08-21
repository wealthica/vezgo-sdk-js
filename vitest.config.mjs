import { defineConfig } from 'vite';

export default defineConfig(() => ({
  test: {
    include: ['__tests__/*.js', '__tests__/resources/*.js'],
    globals: true,
    setupFiles: ['./vitest.setup.js'],
  },
}));
