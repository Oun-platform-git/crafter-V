import React, { useState, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function TimelineTrack({
  type = 'video',
  clips = [],
  onClipAdd,
  onClipMove,
  onClipResize,
  onClipDelete,
  height = 64,
  scale = 1,
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedClip, setDraggedClip] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const trackRef = useRef(null);
  const { isDark } = useTheme();

  const handleClipMouseDown = (e, clip, edge = null) => {
    e.stopPropagation();
    if (edge) {
      setResizeDirection(edge);
    } else {
      setDraggedClip(clip);
    }
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - trackRect.left;
    const time = x / (scale * 100); // 100px per second

    if (resizeDirection) {
      onClipResize(draggedClip.id, resizeDirection, time);
    } else if (draggedClip) {
      onClipMove(draggedClip.id, time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedClip(null);
    setResizeDirection(null);
  };

  const typeColors = {
    video: {
      bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      border: isDark ? 'border-blue-500' : 'border-blue-400',
      text: isDark ? 'text-blue-300' : 'text-blue-700',
    },
    audio: {
      bg: isDark ? 'bg-green-500/20' : 'bg-green-100',
      border: isDark ? 'border-green-500' : 'border-green-400',
      text: isDark ? 'text-green-300' : 'text-green-700',
    },
    text: {
      bg: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
      border: isDark ? 'border-purple-500' : 'border-purple-400',
      text: isDark ? 'text-purple-300' : 'text-purple-700',
    },
    effect: {
      bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
      border: isDark ? 'border-yellow-500' : 'border-yellow-400',
      text: isDark ? 'text-yellow-300' : 'text-yellow-700',
    },
  };

  return (
    <div
      className={`
        relative
        ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}
        border-y
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
        ${className}
      `}
      style={{ height }}
      ref={trackRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {clips.map((clip) => (
        <div
          key={clip.id}
          className={`
            absolute
            top-1
            bottom-1
            flex
            flex-col
            justify-between
            border
            rounded-md
            cursor-move
            group
            ${typeColors[type].bg}
            ${typeColors[type].border}
            ${isDragging && draggedClip?.id === clip.id ? 'ring-2 ring-blue-500' : ''}
          `}
          style={{
            left: `${clip.start * scale * 100}px`,
            width: `${(clip.end - clip.start) * scale * 100}px`,
          }}
          onMouseDown={(e) => handleClipMouseDown(e, clip)}
        >
          {/* Resize handles */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize hover:bg-blue-500/50"
            onMouseDown={(e) => handleClipMouseDown(e, clip, 'start')}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize hover:bg-blue-500/50"
            onMouseDown={(e) => handleClipMouseDown(e, clip, 'end')}
          />

          {/* Clip content */}
          <div className="p-2 flex items-center justify-between">
            <span className={`text-sm font-medium truncate ${typeColors[type].text}`}>
              {clip.name}
            </span>
            <button
              onClick={() => onClipDelete(clip.id)}
              className={`
                opacity-0
                group-hover:opacity-100
                p-1
                rounded-full
                ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100'}
                ${isDark ? 'text-red-400' : 'text-red-600'}
                transition-opacity
                duration-200
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Waveform or thumbnail */}
          <div className="flex-1 px-2">
            {type === 'audio' ? (
              <div className="w-full h-8 bg-current opacity-20 rounded">
                {/* Audio waveform visualization */}
              </div>
            ) : type === 'video' ? (
              <div className="w-full h-8 bg-current opacity-20 rounded">
                {/* Video thumbnail */}
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {/* Add clip button */}
      <button
        onClick={onClipAdd}
        className={`
          absolute
          right-2
          top-1/2
          -translate-y-1/2
          p-1
          rounded-full
          ${isDark ? 'bg-gray-700' : 'bg-white'}
          ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}
          ${isDark ? 'text-gray-300' : 'text-gray-700'}
          shadow-sm
          transition-colors
          duration-200
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
