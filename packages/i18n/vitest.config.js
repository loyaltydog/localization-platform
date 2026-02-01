import { defineConfig } from 'vitest/config';

// Setup vitest to use jest-dom matchers
const setupFiles = ['./src/react/__tests__/setup.js'];

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles,
    include: ['src/**/__tests__/**/*.test.{js,jsx,ts,tsx}', 'src/**/__tests__/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
});
