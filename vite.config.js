import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import mix from 'vite-plugin-mix';

export default defineConfig({
  plugins: [solidPlugin(), mix({ handler: './api.ts', }),],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
