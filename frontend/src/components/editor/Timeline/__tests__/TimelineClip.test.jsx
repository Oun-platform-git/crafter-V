// Mock dependencies first
import React from 'react';
import { vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef((props, ref) => {
      const { animate, initial, exit, transition, ...rest } = props;
      return <div ref={ref} {...rest}>{props.children}</div>;
    }),
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
}));

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import TimelineClip from '../TimelineClip';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { DndContext } from '@dnd-kit/core';
import { createMockEvent, waitForAnimations } from '../../../../test/testUtils.jsx';

const defaultProps = {
  clip: {
    id: '123',
    type: 'video',
    start: 0,
    duration: 5,
    src: 'test.mp4',
    muted: false,
    locked: false,
  },
  isSelected: false,
  onSelect: vi.fn(),
  onChange: vi.fn(),
  zoom: 1,
  snapToGrid: true,
  gridSize: 1,
};

const renderClip = (props = {}) => {
  return render(
    <ThemeProvider>
      <DndContext>
        <TimelineClip {...defaultProps} {...props} />
      </DndContext>
    </ThemeProvider>
  );
};

describe('TimelineClip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderClip();
    expect(screen.getByTestId('timeline-clip')).toBeInTheDocument();
  });

  it('shows selection state', () => {
    renderClip({ isSelected: true });
    const clip = screen.getByTestId('timeline-clip');
    expect(clip).toHaveClass('ring-2');
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    renderClip({ onSelect });
    
    const clip = screen.getByTestId('timeline-clip');
    fireEvent.click(clip);
    
    await waitForAnimations();
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows correct duration', () => {
    renderClip({
      clip: {
        ...defaultProps.clip,
        duration: 10,
      },
    });
    
    expect(screen.getByText('00:00:10')).toBeInTheDocument();
  });

  it('applies zoom level correctly', () => {
    const zoom = 2;
    renderClip({ zoom });
    
    const clip = screen.getByTestId('timeline-clip');
    const expectedWidth = `${defaultProps.clip.duration * 100 * zoom}px`;
    expect(clip.style.width).toBe(expectedWidth);
  });

  it('handles clip resizing', async () => {
    const onChange = vi.fn();
    renderClip({ onChange });
    
    const rightHandle = screen.getByTestId('resize-right');
    
    // Simulate drag
    fireEvent.mouseDown(rightHandle, createMockEvent('mousedown', { clientX: 0 }));
    fireEvent.mouseMove(document, createMockEvent('mousemove', { clientX: 100 }));
    fireEvent.mouseUp(document);
    
    await waitForAnimations();
    expect(onChange).toHaveBeenCalled();
  });

  it('snaps to grid when enabled', async () => {
    const onChange = vi.fn();
    renderClip({
      onChange,
      snapToGrid: true,
      gridSize: 2,
    });
    
    const rightHandle = screen.getByTestId('resize-right');
    
    // Simulate drag that should snap to nearest grid point
    fireEvent.mouseDown(rightHandle, createMockEvent('mousedown', { clientX: 0 }));
    fireEvent.mouseMove(document, createMockEvent('mousemove', { clientX: 150 }));
    fireEvent.mouseUp(document);
    
    await waitForAnimations();
    const calls = onChange.mock.calls;
    const lastCall = calls[calls.length - 1];
    const newDuration = lastCall[0].duration;
    
    expect(newDuration % 2).toBe(0);
  });

  it('prevents resizing when clip is locked', async () => {
    const onChange = vi.fn();
    renderClip({
      onChange,
      clip: {
        ...defaultProps.clip,
        locked: true,
      },
    });
    
    const clip = screen.getByTestId('timeline-clip');
    expect(clip).not.toContainElement(screen.queryByTestId('resize-right'));
    expect(clip).not.toContainElement(screen.queryByTestId('resize-left'));
  });

  it('shows locked state correctly', () => {
    renderClip({
      clip: {
        ...defaultProps.clip,
        locked: true,
      },
    });
    
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  it('shows muted state correctly', () => {
    renderClip({
      clip: {
        ...defaultProps.clip,
        muted: true,
      },
    });
    
    expect(screen.getByTestId('mute-icon')).toBeInTheDocument();
  });

  it('toggles mute state when mute button is clicked', async () => {
    const onChange = vi.fn();
    renderClip({ onChange });
    
    const muteButton = screen.getByRole('button', { name: /toggle mute/i });
    fireEvent.click(muteButton);
    
    await waitForAnimations();
    expect(onChange).toHaveBeenCalledWith({
      muted: true,
    });
  });

  it('toggles lock state when lock button is clicked', async () => {
    const onChange = vi.fn();
    renderClip({ onChange });
    
    const lockButton = screen.getByRole('button', { name: /toggle lock/i });
    fireEvent.click(lockButton);
    
    await waitForAnimations();
    expect(onChange).toHaveBeenCalledWith({
      locked: true,
    });
  });

  it('positions clip correctly based on start time', () => {
    renderClip({
      clip: {
        ...defaultProps.clip,
        start: 10,
      },
    });
    
    const clip = screen.getByTestId('timeline-clip');
    expect(clip.style.left).toBe('1000px'); // 10 seconds * 100 pixels per second
  });

  it('sets clip width based on duration', () => {
    renderClip({
      clip: {
        ...defaultProps.clip,
        duration: 15,
      },
    });
    
    const clip = screen.getByTestId('timeline-clip');
    expect(clip.style.width).toBe('1500px'); // 15 seconds * 100 pixels per second
  });
});
