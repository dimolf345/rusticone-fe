import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@env/': `${path.resolve(__dirname, 'src/environments')}/`,
      '@env': path.resolve(__dirname, 'src/environments/environment'),
      '#styles': path.resolve(__dirname, 'src/styles.css'),
    },
  },
});
