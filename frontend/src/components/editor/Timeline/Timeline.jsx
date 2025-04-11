import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import TimelineTrack from './TimelineTrack';

export default function Timeline({
  tracks = [],
  currentTime = 0,
  duration = 300, // 5 minutes default
  onTimeUpdate,
  onTrackUpdate,
  className = '',
}) {
  const [scale, setScale] = useState(1); // pixels per second
  const [isDragging, setIsDragging] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineRef = useRef(null);
  const { isDark } = useTheme();

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(Math.min(Math.max(0.1, scale + delta), 5));
    }
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const newTime = x / (scale * 100);
    onTimeUpdate(Math.max(0, Math.min(newTime, duration)));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const renderTimeMarkers = () => {
    const markers = [];
    const step = scale < 0.5 ? 10 : scale < 1 ? 5 : 1;
    
    for (let i = 0; i <= duration; i += step) {
      markers.push(
        <div
          key={i}
          className="absolute h-full flex flex-col items-center"
          style={{ left: `${i * scale * 100}px` }}
        >
          <div
            className={`
              h-3
              w-px
              ${isDark ? 'bg-gray-600' : 'bg-gray-300'}
              ${i % (step * 5) === 0 ? 'h-4' : ''}
            `}
          />
          {i % (step * 5) === 0 && (
            <span
              className={`
                text-xs
                mt-1
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              {formatTime(i)}
            </span>
          )}
        </div>
      );
    }
    return markers;
  };

  return (
    <div
      className={`
        flex
        flex-col
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        border
        ${isDark ? 'border-gray-800' : 'border-gray-200'}
        rounded-lg
        ${className}
      `}
    >
      {/* Timeline controls */}
      <div
        className={`
          flex
          items-center
          justify-between
          p-2
          border-b
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.1, scale - 0.1))}
            className={`
              p-1
              rounded-lg
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              ${isDark ? 'text-gray-400' : 'text-gray-600'}
              transition-colors
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(5, scale + 0.1))}
            className={`
              p-1
              rounded-lg
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              ${isDark ? 'text-gray-400' : 'text-gray-600'}
              transition-colors
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Timeline ruler */}
      <div
        className={`
          relative
          h-8
          border-b
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
          overflow-hidden
        `}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: `${duration * scale * 100}px` }}
        >
          {renderTimeMarkers()}
        </div>
      </div>

      {/* Timeline content */}
      <div
        ref={timelineRef}
        className="relative flex-1 overflow-x-auto overflow-y-hidden"
        onWheel={handleWheel}
        onClick={handleTimelineClick}
        onScroll={(e) => setScrollLeft(e.target.scrollLeft)}
      >
        <div
          className="relative"
          style={{ width: `${duration * scale * 100}px` }}
        >
          {/* Playhead */}
          <div
            className={`
              absolute
              top-0
              bottom-0
              w-px
              bg-red-500
              z-10
              pointer-events-none
            `}
            style={{ left: `${currentTime * scale * 100}px` }}
          >
            <div className="w-3 h-3 -ml-1.5 bg-red-500 transform rotate-45" />
          </div>

          {/* Tracks */}
          {tracks.map((track, index) => (
            <TimelineTrack
              key={track.id}
              {...track}
              scale={scale}
              onClipAdd={() => {/* Handle clip add */}}
              onClipMove={(clipId, time) => {/* Handle clip move */}}
              onClipResize={(clipId, edge, time) => {/* Handle clip resize */}}
              onClipDelete={(clipId) => {/* Handle clip delete */}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
