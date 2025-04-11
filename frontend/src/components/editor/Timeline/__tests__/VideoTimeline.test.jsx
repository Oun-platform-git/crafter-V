import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VideoTimeline from '../VideoTimeline';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useTimelineStore } from '../store';
import { mockWaveSurfer, mockToast, mockFramerMotion, waitForAnimations } from '../../../../test/testUtils.jsx';

// Mock dependencies
vi.mock('wavesurfer.js', () => ({
  default: mockWaveSurfer,
}));

vi.mock('sonner', () => ({
  toast: mockToast,
}));

vi.mock('framer-motion', () => mockFramerMotion);

const renderTimeline = () => {
  return render(
    <ThemeProvider>
      <VideoTimeline />
    </ThemeProvider>
  );
};

describe('VideoTimeline', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Reset the store
    useTimelineStore.setState({
      clips: [],
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      zoom: 1,
      selectedClipId: null,
      clipboard: null,
      undoStack: [],
      redoStack: [],
    });
  });

  it('renders correctly', () => {
    renderTimeline();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('handles clip addition', async () => {
    renderTimeline();
    const store = useTimelineStore.getState();
    
    act(() => {
      store.addClip({
        type: 'video',
        start: 0,
        duration: 5,
        src: 'test.mp4',
      });
    });

    await waitForAnimations();
    expect(useTimelineStore.getState().clips).toHaveLength(1);
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('handles clip selection', async () => {
    renderTimeline();
    const store = useTimelineStore.getState();
    
    act(() => {
      store.addClip({
        type: 'video',
        start: 0,
        duration: 5,
        src: 'test.mp4',
      });
    });

    await waitForAnimations();
    const clip = screen.getByTestId('timeline-clip');
    fireEvent.click(clip);

    expect(useTimelineStore.getState().selectedClipId).toBeTruthy();
  });

  it('handles keyboard shortcuts', async () => {
    renderTimeline();
    const store = useTimelineStore.getState();
    
    // Add a clip
    act(() => {
      store.addClip({
        type: 'video',
        start: 0,
        duration: 5,
        src: 'test.mp4',
      });
    });

    await waitForAnimations();
    const clipId = useTimelineStore.getState().clips[0].id;
    store.setSelectedClipId(clipId);

    // Test copy/paste
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    expect(mockToast.success).toHaveBeenCalledWith('Clip copied');

    fireEvent.keyDown(document, { key: 'v', ctrlKey: true });
    expect(useTimelineStore.getState().clips).toHaveLength(2);
    expect(mockToast.success).toHaveBeenCalledWith('Clip pasted');

    // Test undo/redo
    fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
    expect(useTimelineStore.getState().clips).toHaveLength(1);
    expect(mockToast.info).toHaveBeenCalledWith('Undo');

    fireEvent.keyDown(document, { key: 'y', ctrlKey: true });
    expect(useTimelineStore.getState().clips).toHaveLength(2);
    expect(mockToast.info).toHaveBeenCalledWith('Redo');
  });

  it('handles clip splitting', async () => {
    renderTimeline();
    const store = useTimelineStore.getState();
    
    // Add a clip
    act(() => {
      store.addClip({
        type: 'video',
        start: 0,
        duration: 10,
        src: 'test.mp4',
      });
    });

    await waitForAnimations();
    const clipId = useTimelineStore.getState().clips[0].id;
    
    act(() => {
      store.setSelectedClipId(clipId);
      store.setCurrentTime(5); // Set current time to middle of clip
      store.splitClip();
    });

    const clips = useTimelineStore.getState().clips;
    expect(clips).toHaveLength(2);
    expect(clips[0].duration).toBe(5);
    expect(clips[1].start).toBe(5);
    expect(mockToast.success).toHaveBeenCalledWith('Clip split');
  });

  it('handles timeline zoom', async () => {
    renderTimeline();
    const store = useTimelineStore.getState();
    
    act(() => {
      store.setZoom(2);
    });

    await waitForAnimations();
    const timeline = screen.getByTestId('timeline-content');
    expect(timeline.style.transform).toContain('scaleX(2)');
  });

  it('initializes WaveSurfer correctly', () => {
    renderTimeline();
    expect(mockWaveSurfer.create).toHaveBeenCalled();
  });

  it('cleans up WaveSurfer on unmount', () => {
    const { unmount } = renderTimeline();
    unmount();
    expect(mockWaveSurfer.create().destroy).toHaveBeenCalled();
  });
});
