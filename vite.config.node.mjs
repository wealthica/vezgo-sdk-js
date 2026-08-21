import {defineConfig} from 'vite';

// Note: src/index.d.ts is copied to dist/ by the `build:types` npm script rather than
// a plugin — it is a single-file copy, and the dedicated plugin was an extra dependency
// (with its own advisories) for one `cp`.
export default defineConfig({
  build: {
    emptyOutDir: false,
    target: 'node18',
    lib: {
      entry: './src/index.js',
      name: 'Vezgo',
      fileName: 'vezgo',
    },
    rollupOptions: {
      external: ['axios', 'apisauce', 'jsonwebtoken'],
      output: [
        {
          format: 'es',
          dir: 'dist',
          entryFileNames: 'vezgo.es.js',
        },
        {
          format: 'cjs',
          dir: 'dist',
          entryFileNames: 'vezgo.cjs.js',
        },
      ]
    },
  },
});
