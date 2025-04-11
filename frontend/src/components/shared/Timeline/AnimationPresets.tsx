import { FC } from 'react';
import { Keyframe } from './Timeline';

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'motion' | 'transform' | 'text' | 'effects';
  properties: {
    [propertyName: string]: {
      keyframes: Keyframe[];
    };
  };
}

const defaultPresets: AnimationPreset[] = [
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Fade from transparent to fully visible',
    category: 'effects',
    properties: {
      opacity: {
        keyframes: [
          { id: 'k1', time: 0, properties: { opacity: { value: 0, easing: 'ease-out' } } },
          { id: 'k2', time: 1, properties: { opacity: { value: 1 } } }
        ]
      }
    }
  },
  {
    id: 'slide-in-right',
    name: 'Slide In Right',
    description: 'Slide in from the right side',
    category: 'motion',
    properties: {
      x: {
        keyframes: [
          { id: 'k1', time: 0, properties: { x: { value: 100, easing: 'ease-out' } } },
          { id: 'k2', time: 1, properties: { x: { value: 0 } } }
        ]
      }
    }
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    description: 'Scale up with a bouncy effect',
    category: 'transform',
    properties: {
      scale: {
        keyframes: [
          { id: 'k1', time: 0, properties: { scale: { value: 0, easing: 'bounce' } } },
          { id: 'k2', time: 0.6, properties: { scale: { value: 1.2, easing: 'bounce' } } },
          { id: 'k3', time: 1, properties: { scale: { value: 1 } } }
        ]
      }
    }
  },
  {
    id: 'type-in',
    name: 'Type In',
    description: 'Typewriter text animation',
    category: 'text',
    properties: {
      'text-progress': {
        keyframes: [
          { id: 'k1', time: 0, properties: { 'text-progress': { value: 0, easing: 'linear' } } },
          { id: 'k2', time: 1, properties: { 'text-progress': { value: 1 } } }
        ]
      }
    }
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Spin in while fading',
    category: 'transform',
    properties: {
      rotation: {
        keyframes: [
          { id: 'k1', time: 0, properties: { rotation: { value: -180, easing: 'ease-out' } } },
          { id: 'k2', time: 1, properties: { rotation: { value: 0 } } }
        ]
      },
      opacity: {
        keyframes: [
          { id: 'k1', time: 0, properties: { opacity: { value: 0, easing: 'ease-out' } } },
          { id: 'k2', time: 1, properties: { opacity: { value: 1 } } }
        ]
      }
    }
  },
  {
    id: 'pop-in',
    name: 'Pop In',
    description: 'Scale and bounce with elastic effect',
    category: 'transform',
    properties: {
      scale: {
        keyframes: [
          { id: 'k1', time: 0, properties: { scale: { value: 0, easing: 'bounce' } } },
          { id: 'k2', time: 0.5, properties: { scale: { value: 1.2, easing: 'bounce' } } },
          { id: 'k3', time: 0.7, properties: { scale: { value: 0.8, easing: 'bounce' } } },
          { id: 'k4', time: 0.9, properties: { scale: { value: 1.1, easing: 'bounce' } } },
          { id: 'k5', time: 1, properties: { scale: { value: 1 } } }
        ]
      }
    }
  },
  {
    id: 'rainbow-text',
    name: 'Rainbow Text',
    description: 'Cycle through rainbow colors',
    category: 'text',
    properties: {
      color: {
        keyframes: [
          { id: 'k1', time: 0, properties: { color: { value: '#ff0000', easing: 'linear' } } },
          { id: 'k2', time: 0.2, properties: { color: { value: '#ff9900' } } },
          { id: 'k3', time: 0.4, properties: { color: { value: '#ffff00' } } },
          { id: 'k4', time: 0.6, properties: { color: { value: '#00ff00' } } },
          { id: 'k5', time: 0.8, properties: { color: { value: '#0099ff' } } },
          { id: 'k6', time: 1, properties: { color: { value: '#ff0099' } } }
        ]
      }
    }
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Wavy motion animation',
    category: 'motion',
    properties: {
      y: {
        keyframes: [
          { id: 'k1', time: 0, properties: { y: { value: 0, easing: 'ease-in-out' } } },
          { id: 'k2', time: 0.25, properties: { y: { value: 20 } } },
          { id: 'k3', time: 0.5, properties: { y: { value: 0 } } },
          { id: 'k4', time: 0.75, properties: { y: { value: -20 } } },
          { id: 'k5', time: 1, properties: { y: { value: 0 } } }
        ]
      }
    }
  },
  {
    id: '3d-flip',
    name: '3D Flip',
    description: 'Flip around Y axis in 3D space',
    category: 'transform',
    properties: {
      position3d: {
        keyframes: [
          { id: 'k1', time: 0, properties: { position3d: { value: { x: 0, y: 0, z: 0 }, easing: 'ease-in-out' } } },
          { id: 'k2', time: 0.5, properties: { position3d: { value: { x: 0, y: 180, z: 50 } } } },
          { id: 'k3', time: 1, properties: { position3d: { value: { x: 0, y: 360, z: 0 } } } }
        ]
      }
    }
  },
  {
    id: 'gradient-morph',
    name: 'Gradient Morph',
    description: 'Smooth gradient color transition',
    category: 'effects',
    properties: {
      gradient: {
        keyframes: [
          {
            id: 'k1',
            time: 0,
            properties: {
              gradient: {
                value: {
                  type: 'linear',
                  angle: 45,
                  stops: [
                    { color: '#ff0000', position: 0 },
                    { color: '#00ff00', position: 1 }
                  ]
                },
                easing: 'linear'
              }
            }
          },
          {
            id: 'k2',
            time: 0.5,
            properties: {
              gradient: {
                value: {
                  type: 'linear',
                  angle: 90,
                  stops: [
                    { color: '#00ff00', position: 0 },
                    { color: '#0000ff', position: 1 }
                  ]
                }
              }
            }
          },
          {
            id: 'k3',
            time: 1,
            properties: {
              gradient: {
                value: {
                  type: 'linear',
                  angle: 135,
                  stops: [
                    { color: '#0000ff', position: 0 },
                    { color: '#ff0000', position: 1 }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  }
];

interface AnimationPresetsProps {
  onPresetSelect: (preset: AnimationPreset) => void;
  selectedCategory?: string;
}

const AnimationPresets: FC<AnimationPresetsProps> = ({
  onPresetSelect,
  selectedCategory
}) => {
  const filteredPresets = selectedCategory
    ? defaultPresets.filter(p => p.category === selectedCategory)
    : defaultPresets;

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {filteredPresets.map(preset => (
        <button
          key={preset.id}
          onClick={() => onPresetSelect(preset)}
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left"
        >
          <div className="text-sm font-medium text-white">{preset.name}</div>
          <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
        </button>
      ))}
    </div>
  );
};

export default AnimationPresets;
