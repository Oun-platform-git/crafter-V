// Mock modules
vi.mock('../../../common/Slider/Slider', () => ({
  Slider: (props) => (
    <input
      type="range"
      value={props.value}
      onChange={(e) => props.onChange(parseFloat(e.target.value))}
      data-testid="zoom-slider"
    />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import TimelineToolbar from '../TimelineToolbar';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { waitForAnimations } from '../../../../test/testUtils.jsx';

const defaultProps = {
  isPlaying: false,
  onPlayPause: vi.fn(),
  currentTime: 10,
  duration: 60,
  zoom: 1,
  onZoomChange: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  canUndo: true,
  canRedo: false,
  onSplit: vi.fn(),
  onCopy: vi.fn(),
  onPaste: vi.fn(),
  onCut: vi.fn(),
  selectedClipId: '123',
};

const renderToolbar = (props = {}) => {
  return render(
    <ThemeProvider>
      <TimelineToolbar {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('TimelineToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderToolbar();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('displays correct time format', () => {
    renderToolbar();
    expect(screen.getByText('00:00:10 / 00:01:00')).toBeInTheDocument();
  });

  it('toggles play/pause button icon', () => {
    const { rerender } = renderToolbar();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <TimelineToolbar {...defaultProps} isPlaying={true} />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('calls onPlayPause when play button is clicked', () => {
    const onPlayPause = vi.fn();
    renderToolbar({ onPlayPause });
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(onPlayPause).toHaveBeenCalled();
  });

  it('disables undo button when canUndo is false', () => {
    renderToolbar({ canUndo: false });
    const undoButton = screen.getByRole('button', { name: /undo/i });
    expect(undoButton).toBeDisabled();
  });

  it('disables redo button when canRedo is false', () => {
    renderToolbar({ canRedo: false });
    const redoButton = screen.getByRole('button', { name: /redo/i });
    expect(redoButton).toBeDisabled();
  });

  it('disables clip operations when no clip is selected', () => {
    renderToolbar({ selectedClipId: null });
    const copyButton = screen.getByRole('button', { name: /copy/i });
    const cutButton = screen.getByRole('button', { name: /cut/i });
    const splitButton = screen.getByRole('button', { name: /split/i });
    
    expect(copyButton).toBeDisabled();
    expect(cutButton).toBeDisabled();
    expect(splitButton).toBeDisabled();
  });

  it('enables clip operations when a clip is selected', () => {
    renderToolbar({ selectedClipId: '123' });
    const copyButton = screen.getByRole('button', { name: /copy/i });
    const cutButton = screen.getByRole('button', { name: /cut/i });
    const splitButton = screen.getByRole('button', { name: /split/i });
    
    expect(copyButton).not.toBeDisabled();
    expect(cutButton).not.toBeDisabled();
    expect(splitButton).not.toBeDisabled();
  });

  it('calls appropriate handlers when clip operation buttons are clicked', () => {
    const onCopy = vi.fn();
    const onCut = vi.fn();
    const onPaste = vi.fn();
    const onSplit = vi.fn();

    renderToolbar({ onCopy, onCut, onPaste, onSplit });

    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(onCopy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /cut/i }));
    expect(onCut).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /paste/i }));
    expect(onPaste).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /split/i }));
    expect(onSplit).toHaveBeenCalled();
  });

  it('shows keyboard shortcuts when clicking the shortcuts button', async () => {
    renderToolbar();
    const shortcutsButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    fireEvent.click(shortcutsButton);
    
    await waitForAnimations();
    const toast = (await import('sonner')).toast;
    expect(toast.custom).toHaveBeenCalled();
  });

  it('handles zoom changes', () => {
    const onZoomChange = vi.fn();
    renderToolbar({ onZoomChange });
    
    const zoomSlider = screen.getByTestId('zoom-slider');
    fireEvent.change(zoomSlider, { target: { value: '2' } });
    
    expect(onZoomChange).toHaveBeenCalledWith(2);
  });
});
