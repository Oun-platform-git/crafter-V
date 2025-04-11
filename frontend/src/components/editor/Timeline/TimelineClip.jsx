import React, { useState, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MIN_CLIP_DURATION = 1; // 1 second
const PIXELS_PER_SECOND = 100;

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function TimelineClip({
  clip,
  isSelected,
  onSelect,
  onChange,
  zoom = 1,
  snapToGrid = true,
  gridSize = 1, // 1 second
}) {
  const { isDark } = useTheme();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartLeft, setResizeStartLeft] = useState(0);
  const [resizeType, setResizeType] = useState(null); // 'start' or 'end'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: clip.id,
    disabled: isResizing,
  });

  const handleResizeStart = useCallback((e, type) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(clip.duration * PIXELS_PER_SECOND * zoom);
    setResizeStartLeft(clip.start * PIXELS_PER_SECOND * zoom);
    setResizeType(type);

    const handleMouseMove = (e) => {
      const delta = e.clientX - resizeStartX;
      let newStart = clip.start;
      let newDuration = clip.duration;

      if (type === 'start') {
        const maxMove = clip.duration - MIN_CLIP_DURATION;
        const moveAmount = Math.max(-resizeStartLeft / (PIXELS_PER_SECOND * zoom),
          Math.min(maxMove, delta / (PIXELS_PER_SECOND * zoom)));
        
        newStart = clip.start + moveAmount;
        newDuration = clip.duration - moveAmount;
      } else {
        const moveAmount = Math.max(
          MIN_CLIP_DURATION - clip.duration,
          delta / (PIXELS_PER_SECOND * zoom)
        );
        newDuration = clip.duration + moveAmount;
      }

      if (snapToGrid) {
        newStart = Math.round(newStart / gridSize) * gridSize;
        newDuration = Math.round(newDuration / gridSize) * gridSize;
      }

      onChange({
        start: newStart,
        duration: newDuration,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      toast.success('Clip resized');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [clip, zoom, onChange, resizeStartX, resizeStartWidth, resizeStartLeft]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? undefined : transition,
    left: `${clip.start * PIXELS_PER_SECOND * zoom}px`,
    width: `${clip.duration * PIXELS_PER_SECOND * zoom}px`,
  };

  const clipColors = {
    video: {
      bg: isDark ? 'bg-blue-500/20' : 'bg-blue-50',
      border: 'border-blue-500',
      hover: isDark ? 'hover:bg-blue-500/30' : 'hover:bg-blue-100',
    },
    audio: {
      bg: isDark ? 'bg-green-500/20' : 'bg-green-50',
      border: 'border-green-500',
      hover: isDark ? 'hover:bg-green-500/30' : 'hover:bg-green-100',
    },
    text: {
      bg: isDark ? 'bg-purple-500/20' : 'bg-purple-50',
      border: 'border-purple-500',
      hover: isDark ? 'hover:bg-purple-500/30' : 'hover:bg-purple-100',
    },
  };

  const colors = clipColors[clip.type] || clipColors.video;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isResizing ? {} : listeners)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: isResizing ? 1 : 1.02 }}
      onClick={onSelect}
      data-testid="timeline-clip"
      className={`
        absolute
        top-0
        h-20
        rounded-lg
        ${isResizing ? 'cursor-ew-resize' : 'cursor-grab active:cursor-grabbing'}
        transition-colors
        ${colors.bg}
        ${colors.border}
        ${colors.hover}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        border
        group
      `}
    >
      <div className="relative h-full p-2 flex flex-col">
        {/* Clip header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            {/* Clip type icon */}
            {clip.type === 'video' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            {clip.type === 'audio' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            )}
            {clip.type === 'text' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </div>

          {/* Clip controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange({ locked: !clip.locked });
                toast.success(clip.locked ? 'Clip unlocked' : 'Clip locked');
              }}
              className={`
                p-1
                rounded
                opacity-0
                group-hover:opacity-100
                transition-opacity
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
              `}
              aria-label="Toggle lock"
            >
              {clip.locked ? (
                <svg data-testid="lock-icon" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange({ muted: !clip.muted });
                toast.success(clip.muted ? 'Clip unmuted' : 'Clip muted');
              }}
              className={`
                p-1
                rounded
                opacity-0
                group-hover:opacity-100
                transition-opacity
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
              `}
              aria-label="Toggle mute"
            >
              {clip.muted ? (
                <svg data-testid="mute-icon" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Open clip settings dialog
              }}
              className={`
                p-1
                rounded
                opacity-0
                group-hover:opacity-100
                transition-opacity
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
              `}
              aria-label="Clip settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Duration label */}
        <div className={`
          absolute
          bottom-1
          right-1
          text-xs
          font-medium
          ${isDark ? 'text-gray-400' : 'text-gray-600'}
        `}>
          {formatDuration(clip.duration)}
        </div>

        {/* Thumbnail or waveform */}
        <div className={`
          flex-1
          rounded
          ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
          ${clip.type === 'audio' ? 'mt-2' : ''}
        `}>
          {clip.type === 'audio' && (
            <div className="w-full h-full" ref={clip.waveformRef} />
          )}
        </div>

        {/* Resize handles */}
        {!clip.locked && (
          <>
            <div
              data-testid="resize-left"
              className={`
                absolute
                left-0
                top-0
                bottom-0
                w-1.5
                cursor-ew-resize
                group-hover:bg-blue-500/50
              `}
              onMouseDown={(e) => handleResizeStart(e, 'start')}
            />
            <div
              data-testid="resize-right"
              className={`
                absolute
                right-0
                top-0
                bottom-0
                w-1.5
                cursor-ew-resize
                group-hover:bg-blue-500/50
              `}
              onMouseDown={(e) => handleResizeStart(e, 'end')}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
