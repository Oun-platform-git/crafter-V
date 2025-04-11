import React, { FC } from 'react';

export interface Transition {
  id: string;
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve';
  duration: number;
  properties: {
    direction?: 'left' | 'right' | 'up' | 'down';
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    intensity?: number;
  };
}

interface TransitionEditorProps {
  transition?: Transition;
  duration: number;
  onTransitionChange: (transition: Transition) => void;
  onTransitionRemove: () => void;
}

const transitionTypes = [
  { id: 'fade', label: 'Fade', icon: '🌓' },
  { id: 'slide', label: 'Slide', icon: '↔️' },
  { id: 'zoom', label: 'Zoom', icon: '🔍' },
  { id: 'wipe', label: 'Wipe', icon: '⬅️' },
  { id: 'dissolve', label: 'Dissolve', icon: '✨' }
];

const TransitionEditor: FC<TransitionEditorProps> = ({
  transition,
  duration,
  onTransitionChange,
  onTransitionRemove
}) => {
  const handleTypeChange = (type: Transition['type']) => {
    if (!transition) {
      onTransitionChange({
        id: Math.random().toString(36).substr(2, 9),
        type,
        duration: Math.min(1, duration),
        properties: {}
      });
      return;
    }

    onTransitionChange({
      ...transition,
      type
    });
  };

  const handlePropertyChange = (key: keyof Transition['properties'], value: any) => {
    if (!transition) return;

    onTransitionChange({
      ...transition,
      properties: {
        ...transition.properties,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Transition</h3>
        {transition && (
          <button
            onClick={onTransitionRemove}
            className="text-red-500 hover:text-red-400"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {transitionTypes.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => handleTypeChange(id as Transition['type'])}
            className={`p-2 rounded-lg flex flex-col items-center ${
              transition?.type === id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {transition && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Duration
            </label>
            <input
              type="range"
              min="0.1"
              max={duration}
              step="0.1"
              value={transition.duration}
              onChange={(e) => onTransitionChange({
                ...transition,
                duration: parseFloat(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-right text-xs text-gray-400">
              {transition.duration.toFixed(1)}s
            </div>
          </div>

          {transition.type === 'slide' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Direction
              </label>
              <select
                value={transition.properties.direction || 'left'}
                onChange={(e) => handlePropertyChange('direction', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-2"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Easing
            </label>
            <select
              value={transition.properties.easing || 'linear'}
              onChange={(e) => handlePropertyChange('easing', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
            >
              <option value="linear">Linear</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
            </select>
          </div>

          {(transition.type === 'zoom' || transition.type === 'dissolve') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Intensity
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={transition.properties.intensity || 1}
                onChange={(e) => handlePropertyChange('intensity', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-right text-xs text-gray-400">
                {(transition.properties.intensity || 1).toFixed(1)}x
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitionEditor;
