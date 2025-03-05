import {defineConfig} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills({ include: ['buffer', 'process', 'stream'] }),
  ],
  build: {
    emptyOutDir: false,
    target: 'esnext',
    lib: {
      entry: './src/index.js',
      name: 'Vezgo',
      fileName: 'vezgo',
    },
    rollupOptions: {
      output: [
        {
          format: 'umd',
          dir: 'dist',
          entryFileNames: 'vezgo.umd.js',
          name: 'Vezgo',
        },
      ]
    },
  },
});
