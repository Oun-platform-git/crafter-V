import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Slider } from '../../common/Slider/Slider';
import { toast } from 'sonner';

const KEYBOARD_SHORTCUTS = [
  { key: 'Space', description: 'Play/Pause' },
  { key: 'Delete', description: 'Remove selected clip' },
  { key: 'Ctrl + Z', description: 'Undo' },
  { key: 'Ctrl + Y', description: 'Redo' },
  { key: 'Ctrl + C', description: 'Copy clip' },
  { key: 'Ctrl + V', description: 'Paste clip' },
  { key: 'Ctrl + X', description: 'Cut clip' },
  { key: '[', description: 'Previous frame' },
  { key: ']', description: 'Next frame' },
  { key: 'S', description: 'Split clip' },
  { key: 'M', description: 'Toggle mute' },
  { key: 'L', description: 'Toggle lock' },
];

export default function TimelineToolbar({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSplit,
  onCopy,
  onPaste,
  onCut,
  selectedClipId,
  className = '',
}) {
  const { isDark } = useTheme();

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  const handleKeyboardShortcutClick = () => {
    toast.custom((t) => (
      <div
        className={`
          ${isDark ? 'bg-gray-800' : 'bg-white'}
          ${isDark ? 'border-gray-700' : 'border-gray-200'}
          border
          rounded-lg
          p-4
          shadow-lg
          max-w-md
          w-full
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => toast.dismiss(t)}
            className={`
              p-1
              rounded-lg
              ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            `}
            aria-label="Close keyboard shortcuts"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex justify-between items-center"
            >
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {shortcut.description}
              </span>
              <kbd
                className={`
                  px-2
                  py-1
                  text-sm
                  font-semibold
                  rounded
                  ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                `}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    ), { duration: 10000 });
  };

  return (
    <div
      data-testid="timeline-toolbar"
      className={`
        flex
        items-center
        justify-between
        p-4
        border-b
        ${isDark ? 'border-gray-800' : 'border-gray-200'}
        ${className}
      `}
    >
      {/* Left section - Playback controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPlayPause()}
            className={`
              p-2
              rounded-lg
              transition-colors
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              // Previous frame (1/30th of a second)
              const newTime = Math.max(0, currentTime - 1/30);
              // Update current time
            }}
            className={`
              p-2
              rounded-lg
              transition-colors
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
            aria-label="Previous frame"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => {
              // Next frame (1/30th of a second)
              const newTime = Math.min(duration, currentTime + 1/30);
              // Update current time
            }}
            className={`
              p-2
              rounded-lg
              transition-colors
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
            aria-label="Next frame"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="text-sm font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Center section - Edit controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${
              canUndo
                ? isDark
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
                : 'opacity-50 cursor-not-allowed'
            }
          `}
          aria-label="Undo"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${
              canRedo
                ? isDark
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
                : 'opacity-50 cursor-not-allowed'
            }
          `}
          aria-label="Redo"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

        <button
          onClick={onCopy}
          disabled={!selectedClipId}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${
              selectedClipId
                ? isDark
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
                : 'opacity-50 cursor-not-allowed'
            }
          `}
          aria-label="Copy"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={onCut}
          disabled={!selectedClipId}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${
              selectedClipId
                ? isDark
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
                : 'opacity-50 cursor-not-allowed'
            }
          `}
          aria-label="Cut"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
        </button>

        <button
          onClick={onPaste}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          `}
          aria-label="Paste"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

        <button
          onClick={onSplit}
          disabled={!selectedClipId}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${
              selectedClipId
                ? isDark
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
                : 'opacity-50 cursor-not-allowed'
            }
          `}
          aria-label="Split"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Right section - Zoom and settings */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={zoom}
            onChange={onZoomChange}
            className="w-32"
          />
        </div>

        <button
          onClick={handleKeyboardShortcutClick}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          `}
          aria-label="Keyboard shortcuts"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
