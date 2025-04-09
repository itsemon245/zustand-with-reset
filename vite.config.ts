import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'zustandWithReset',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['zustand'],
      output: {
        globals: {
          zustand: 'zustand',
        },
      },
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
});