/**
 * Vitest setup file for jest-dom matchers
 */
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Import jest-dom matchers (side-effect import)
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
