import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: './src/index.d.ts',
          dest: '',
        }
      ]
    })
  ],
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
