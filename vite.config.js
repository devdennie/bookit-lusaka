import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/bookit-lusaka/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        book: resolve(import.meta.dirname, 'book.html'),
        owner: resolve(import.meta.dirname, 'owner.html'),
      },
    },
  },
});
