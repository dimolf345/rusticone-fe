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
      '@core/': `${path.resolve(__dirname, 'src/app/core')}/`,
      '@core': path.resolve(__dirname, 'src/app/core'),
      '@env/': `${path.resolve(__dirname, 'src/environments')}/`,
      '@env': path.resolve(__dirname, 'src/environments/environment'),
      '@mocks/': `${path.resolve(__dirname, 'src/app/core/mocks')}/`,
      '@mocks': path.resolve(__dirname, 'src/app/core/mocks'),
      '#styles': path.resolve(__dirname, 'src/styles.css'),
    },
  },
});
