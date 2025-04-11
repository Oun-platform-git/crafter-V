import { vi } from 'vitest';
import React from 'react';

// Mock WaveSurfer
export const mockWaveSurfer = {
  create: vi.fn(() => ({
    on: vi.fn(),
    destroy: vi.fn(),
    playPause: vi.fn(),
    getDuration: () => 60,
    getCurrentTime: () => 30,
    seekTo: vi.fn(),
  })),
};

// Mock toast
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  custom: vi.fn(),
};

// Mock framer-motion
export const mockFramerMotion = {
  motion: {
    div: React.forwardRef((props, ref) => (
      <div ref={ref} {...props} data-testid={props['data-testid']}>{props.children}</div>
    )),
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: (initial) => ({
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
  }),
  useTransform: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
};

// Helper function to create a mock event
export const createMockEvent = (type, data = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  type,
  ...data,
});

// Helper function to wait for animations
export const waitForAnimations = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper function to create a mock ResizeObserver
export const mockResizeObserver = () => {
  window.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
};

// Helper function to create a mock IntersectionObserver
export const mockIntersectionObserver = () => {
  window.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
};

// Mock DND Kit
export const mockDndKit = {
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  CSS: {
    Transform: {
      toString: vi.fn(),
    },
  },
};
