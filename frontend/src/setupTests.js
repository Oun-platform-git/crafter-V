import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Mock matchMedia
beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // Mock ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  // Mock IntersectionObserver
  window.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  // Mock requestAnimationFrame
  window.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0));
  window.cancelAnimationFrame = vi.fn(id => clearTimeout(id));
});

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
});
