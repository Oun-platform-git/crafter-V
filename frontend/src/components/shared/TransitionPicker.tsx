import React, { FC } from 'react';

export interface Transition {
  id: string;
  name: string;
  icon: string;
  duration: number;
  preview?: string;
}

const TRANSITIONS: Transition[] = [
  {
    id: 'fade',
    name: 'Fade',
    icon: '🌫️',
    duration: 0.5
  },
  {
    id: 'slide',
    name: 'Slide',
    icon: '➡️',
    duration: 0.7
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '🔍',
    duration: 0.6
  },
  {
    id: 'wipe',
    name: 'Wipe',
    icon: '🌊',
    duration: 0.5
  },
  {
    id: 'dissolve',
    name: 'Dissolve',
    icon: '✨',
    duration: 0.8
  },
  {
    id: 'flash',
    name: 'Flash',
    icon: '⚡',
    duration: 0.3
  }
];

interface TransitionPickerProps {
  onSelect: (transition: Transition) => void;
  selectedId?: string;
  className?: string;
}

const TransitionPicker: FC<TransitionPickerProps> = ({
  onSelect,
  selectedId,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-white font-medium mb-3">Transitions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TRANSITIONS.map(transition => (
          <button
            key={transition.id}
            onClick={() => onSelect(transition)}
            className={`
              flex items-center space-x-2 p-2 rounded-lg transition-all
              ${selectedId === transition.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }
            `}
          >
            <span className="text-xl">{transition.icon}</span>
            <div className="text-left">
              <div className="text-sm font-medium">{transition.name}</div>
              <div className="text-xs opacity-75">{transition.duration}s</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransitionPicker;
