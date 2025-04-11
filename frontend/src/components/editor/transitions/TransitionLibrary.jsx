import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import TransitionPreview from './TransitionPreview';

const TRANSITIONS = [
  {
    id: 'basic',
    label: 'Basic',
    items: [
      { type: 'fade', label: 'Fade', icon: '⚡' },
      { type: 'slide', label: 'Slide', icon: '↔️' },
      { type: 'zoom', label: 'Zoom', icon: '🔍' },
      { type: 'wipe', label: 'Wipe', icon: '⬅️' },
      { type: 'dissolve', label: 'Dissolve', icon: '✨' },
    ],
  },
  {
    id: 'dynamic',
    label: 'Dynamic',
    items: [
      { type: 'rotate', label: 'Rotate', icon: '🔄' },
      { type: 'flip', label: 'Flip', icon: '⟲' },
      { type: 'bounce', label: 'Bounce', icon: '⚽' },
      { type: 'elastic', label: 'Elastic', icon: '🎯' },
    ],
  },
  {
    id: 'creative',
    label: 'Creative',
    items: [
      { type: 'glitch', label: 'Glitch', icon: '⚡' },
      { type: 'pixelate', label: 'Pixelate', icon: '🔲' },
      { type: 'blur', label: 'Blur', icon: '🌫' },
      { type: 'wave', label: 'Wave', icon: '🌊' },
    ],
  },
];

export default function TransitionLibrary({
  onSelect,
  className = '',
}) {
  const { isDark } = useTheme();
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelect = (transition) => {
    setSelectedTransition(transition);
    onSelect?.(transition);
  };

  const handlePreview = (transition) => {
    setSelectedTransition(transition);
    setIsPlaying(true);
  };

  return (
    <div
      className={`
        flex
        flex-col
        h-full
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        ${isDark ? 'border-gray-800' : 'border-gray-200'}
        border
        rounded-lg
        ${className}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex
          items-center
          justify-between
          p-4
          border-b
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
          Transition Library
        </h2>
      </div>

      {/* Preview */}
      <div className="p-4">
        <TransitionPreview
          type={selectedTransition?.type || 'fade'}
          duration={1}
          isPlaying={isPlaying}
          onComplete={() => setIsPlaying(false)}
          className="w-full"
        />
      </div>

      {/* Transitions list */}
      <div className="flex-1 overflow-y-auto p-4">
        {TRANSITIONS.map((category) => (
          <div key={category.id} className="mb-6 last:mb-0">
            <h3
              className={`
                text-sm
                font-medium
                mb-3
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}
            >
              {category.label}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {category.items.map((transition) => (
                <button
                  key={transition.type}
                  onClick={() => handleSelect(transition)}
                  onDoubleClick={() => handlePreview(transition)}
                  className={`
                    flex
                    items-center
                    gap-2
                    p-3
                    rounded-lg
                    transition-colors
                    ${
                      selectedTransition?.type === transition.type
                        ? isDark
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-blue-50 text-blue-600'
                        : isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <span className="text-xl">{transition.icon}</span>
                  <span className="text-sm font-medium">{transition.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div
        className={`
          p-4
          border-t
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        <div className="flex gap-2">
          <button
            onClick={() => handlePreview(selectedTransition)}
            disabled={!selectedTransition}
            className={`
              flex-1
              px-4
              py-2
              rounded-lg
              font-medium
              transition-colors
              ${
                !selectedTransition
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Preview
          </button>
          <button
            onClick={() => handleSelect(selectedTransition)}
            disabled={!selectedTransition}
            className={`
              flex-1
              px-4
              py-2
              rounded-lg
              font-medium
              transition-colors
              ${
                !selectedTransition
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
