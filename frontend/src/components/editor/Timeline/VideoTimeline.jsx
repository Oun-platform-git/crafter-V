import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useHotkeys } from 'react-hotkeys-hook';
import WaveSurfer from 'wavesurfer.js';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineClip from './TimelineClip';
import TimelineToolbar from './TimelineToolbar';
import { create } from 'zustand';

// Timeline store with Zustand
const useTimelineStore = create((set, get) => ({
  clips: [],
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  zoom: 1,
  selectedClipId: null,
  clipboard: null,
  undoStack: [],
  redoStack: [],
  
  addClip: (clip) => {
    const newClip = { ...clip, id: Math.random().toString() };
    set((state) => {
      const newState = { clips: [...state.clips, newClip] };
      get().pushToHistory(newState);
      return newState;
    });
  },
  
  removeClip: (clipId) => set((state) => {
    const newState = { clips: state.clips.filter((clip) => clip.id !== clipId) };
    get().pushToHistory(newState);
    return newState;
  }),
  
  updateClip: (clipId, updates) => set((state) => {
    const newState = {
      clips: state.clips.map((clip) => 
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    };
    get().pushToHistory(newState);
    return newState;
  }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  
  copyClip: () => {
    const { clips, selectedClipId } = get();
    const clipToCopy = clips.find(clip => clip.id === selectedClipId);
    if (clipToCopy) {
      set({ clipboard: { ...clipToCopy } });
      toast.success('Clip copied');
    }
  },
  
  cutClip: () => {
    const { clips, selectedClipId } = get();
    const clipToCut = clips.find(clip => clip.id === selectedClipId);
    if (clipToCut) {
      set((state) => ({
        clipboard: { ...clipToCut },
        clips: state.clips.filter(clip => clip.id !== selectedClipId)
      }));
      toast.success('Clip cut');
    }
  },
  
  pasteClip: () => {
    const { clipboard, currentTime } = get();
    if (clipboard) {
      const newClip = {
        ...clipboard,
        id: Math.random().toString(),
        start: currentTime
      };
      set((state) => ({ clips: [...state.clips, newClip] }));
      toast.success('Clip pasted');
    }
  },
  
  splitClip: () => {
    const { clips, selectedClipId, currentTime } = get();
    const clipToSplit = clips.find(clip => clip.id === selectedClipId);
    
    if (clipToSplit && currentTime > clipToSplit.start && currentTime < clipToSplit.start + clipToSplit.duration) {
      const timeOffset = currentTime - clipToSplit.start;
      
      const firstHalf = {
        ...clipToSplit,
        duration: timeOffset
      };
      
      const secondHalf = {
        ...clipToSplit,
        id: Math.random().toString(),
        start: currentTime,
        duration: clipToSplit.duration - timeOffset
      };
      
      set((state) => ({
        clips: [
          ...state.clips.filter(clip => clip.id !== selectedClipId),
          firstHalf,
          secondHalf
        ]
      }));
      
      toast.success('Clip split');
    }
  },
  
  pushToHistory: (state) => {
    set((prev) => ({
      undoStack: [...prev.undoStack, prev],
      redoStack: []
    }));
  },
  
  undo: () => {
    const { undoStack } = get();
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      set((state) => ({
        ...previousState,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state]
      }));
      toast.info('Undo');
    }
  },
  
  redo: () => {
    const { redoStack } = get();
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      set((state) => ({
        ...nextState,
        redoStack: redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state]
      }));
      toast.info('Redo');
    }
  }
}));

export default function VideoTimeline() {
  const { isDark } = useTheme();
  const waveformRef = useRef(null);
  const containerRef = useRef(null);
  const wavesurfer = useRef(null);
  
  const {
    clips,
    currentTime,
    duration,
    isPlaying,
    zoom,
    selectedClipId,
    undoStack,
    redoStack,
    addClip,
    removeClip,
    updateClip,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setZoom,
    setSelectedClipId,
    copyClip,
    cutClip,
    pasteClip,
    splitClip,
    undo,
    redo
  } = useTimelineStore();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: isDark ? '#4B5563' : '#9CA3AF',
        progressColor: isDark ? '#60A5FA' : '#3B82F6',
        cursorColor: isDark ? '#F9FAFB' : '#1F2937',
        barWidth: 2,
        barGap: 1,
        height: 40,
        normalize: true,
      });

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current.getDuration());
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });

      return () => {
        wavesurfer.current.destroy();
      };
    }
  }, []);

  // Keyboard shortcuts
  useHotkeys('space', (e) => {
    e.preventDefault();
    setIsPlaying(!isPlaying);
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  });

  useHotkeys('delete', () => {
    if (selectedClipId) {
      removeClip(selectedClipId);
      toast.success('Clip removed');
    }
  });

  useHotkeys('ctrl+z', (e) => {
    e.preventDefault();
    undo();
  });

  useHotkeys('ctrl+y', (e) => {
    e.preventDefault();
    redo();
  });

  useHotkeys('ctrl+c', (e) => {
    e.preventDefault();
    copyClip();
  });

  useHotkeys('ctrl+x', (e) => {
    e.preventDefault();
    cutClip();
  });

  useHotkeys('ctrl+v', (e) => {
    e.preventDefault();
    pasteClip();
  });

  useHotkeys('s', (e) => {
    if (e.target.tagName !== 'INPUT') {
      e.preventDefault();
      splitClip();
    }
  });

  useHotkeys('[', (e) => {
    e.preventDefault();
    const newTime = Math.max(0, currentTime - 1/30);
    setCurrentTime(newTime);
    wavesurfer.current?.seekTo(newTime / duration);
  });

  useHotkeys(']', (e) => {
    e.preventDefault();
    const newTime = Math.min(duration, currentTime + 1/30);
    setCurrentTime(newTime);
    wavesurfer.current?.seekTo(newTime / duration);
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = clips.findIndex((clip) => clip.id === active.id);
      const newIndex = clips.findIndex((clip) => clip.id === over.id);
      
      const newClips = [...clips];
      const [removed] = newClips.splice(oldIndex, 1);
      newClips.splice(newIndex, 0, removed);
      
      useTimelineStore.setState({ clips: newClips });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`
        flex
        flex-col
        h-full
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        ${isDark ? 'border-gray-800' : 'border-gray-200'}
        border
        rounded-lg
      `}
    >
      <TimelineToolbar
        isPlaying={isPlaying}
        onPlayPause={() => {
          setIsPlaying(!isPlaying);
          wavesurfer.current?.playPause();
        }}
        currentTime={currentTime}
        duration={duration}
        zoom={zoom}
        onZoomChange={setZoom}
        onUndo={undo}
        onRedo={redo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onSplit={splitClip}
        onCopy={copyClip}
        onPaste={pasteClip}
        onCut={cutClip}
        selectedClipId={selectedClipId}
      />

      {/* Waveform */}
      <div 
        ref={waveformRef}
        className="w-full px-4 py-2"
        style={{ transform: `scaleX(${zoom})` }}
      />

      {/* Timeline tracks */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={clips} strategy={horizontalListSortingStrategy}>
            <div className="relative min-h-[100px]">
              <AnimatePresence>
                {clips.map((clip) => (
                  <TimelineClip
                    key={clip.id}
                    clip={clip}
                    isSelected={selectedClipId === clip.id}
                    onSelect={() => setSelectedClipId(clip.id)}
                    onChange={(updates) => updateClip(clip.id, updates)}
                    zoom={zoom}
                    snapToGrid
                    gridSize={1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
