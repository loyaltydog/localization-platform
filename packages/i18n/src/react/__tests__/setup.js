/**
 * Vitest setup file for jest-dom matchers
 */
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Import jest-dom matchers (Vitest-specific entrypoint)
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
