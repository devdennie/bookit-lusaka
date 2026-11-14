import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/bookit-lusaka/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        campuses: resolve(import.meta.dirname, 'campuses.html'),
        nipa: resolve(import.meta.dirname, 'nipa.html'),
        book: resolve(import.meta.dirname, 'book.html'),
        owner: resolve(import.meta.dirname, 'owner.html'),
      },
    },
  },
});
