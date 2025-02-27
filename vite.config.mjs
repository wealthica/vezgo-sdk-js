import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills(),
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
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: ['esnext', 'node18'],
    outDir: 'lib',
    lib: {
      entry: './src/index.js',
      name: 'Vezgo',
      fileName: 'vezgo',
      formats: ['es', 'cjs', 'umd'],
    },
  },
});