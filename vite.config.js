import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/bookit-lusaka/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        owner: resolve(import.meta.dirname, 'owner.html'),
      },
    },
  },
});
