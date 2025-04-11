import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Slider from '../common/Slider/Slider';
import ColorPicker from '../common/ColorPicker/ColorPicker';
import Select from '../common/Select/Select';

const TRANSITIONS = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'dissolve', label: 'Dissolve' },
];

const FILTERS = [
  { value: 'none', label: 'None' },
  { value: 'blur', label: 'Blur' },
  { value: 'brightness', label: 'Brightness' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'hue-rotate', label: 'Hue Rotate' },
  { value: 'saturate', label: 'Saturate' },
];

const TEXT_ANIMATIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'scale-in', label: 'Scale In' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'typing', label: 'Typing' },
];

export default function EffectsPanel({
  selectedClip,
  onEffectChange,
  className = '',
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('transitions');
  const [effects, setEffects] = useState({
    transition: { type: 'fade', duration: 1 },
    filter: { type: 'none', intensity: 0 },
    textAnimation: { type: 'none', duration: 1 },
    overlay: { color: '#000000', opacity: 0 },
  });

  const handleEffectChange = (category, value) => {
    const newEffects = { ...effects, [category]: { ...effects[category], ...value } };
    setEffects(newEffects);
    onEffectChange?.(newEffects);
  };

  const tabs = [
    { id: 'transitions', label: 'Transitions', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    )},
    { id: 'filters', label: 'Filters', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )},
    { id: 'animations', label: 'Animations', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )},
    { id: 'overlay', label: 'Overlay', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
  ];

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
          Effects & Transitions
        </h2>
      </div>

      {/* Tabs */}
      <div
        className={`
          flex
          gap-1
          p-2
          border-b
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              text-sm
              font-medium
              transition-colors
              ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-gray-800 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'transitions' && (
          <div className="space-y-4">
            <Select
              label="Transition Type"
              value={TRANSITIONS.find(t => t.value === effects.transition.type)}
              onChange={(option) => handleEffectChange('transition', { type: option.value })}
              options={TRANSITIONS}
            />
            <Slider
              label="Duration (seconds)"
              min={0}
              max={5}
              step={0.1}
              value={effects.transition.duration}
              onChange={(value) => handleEffectChange('transition', { duration: value })}
            />
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-4">
            <Select
              label="Filter Type"
              value={FILTERS.find(f => f.value === effects.filter.type)}
              onChange={(option) => handleEffectChange('filter', { type: option.value })}
              options={FILTERS}
            />
            <Slider
              label="Intensity"
              min={0}
              max={100}
              value={effects.filter.intensity}
              onChange={(value) => handleEffectChange('filter', { intensity: value })}
            />
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="space-y-4">
            <Select
              label="Animation Type"
              value={TEXT_ANIMATIONS.find(a => a.value === effects.textAnimation.type)}
              onChange={(option) => handleEffectChange('textAnimation', { type: option.value })}
              options={TEXT_ANIMATIONS}
            />
            <Slider
              label="Duration (seconds)"
              min={0}
              max={5}
              step={0.1}
              value={effects.textAnimation.duration}
              onChange={(value) => handleEffectChange('textAnimation', { duration: value })}
            />
          </div>
        )}

        {activeTab === 'overlay' && (
          <div className="space-y-4">
            <ColorPicker
              label="Overlay Color"
              value={effects.overlay.color}
              onChange={(color) => handleEffectChange('overlay', { color })}
            />
            <Slider
              label="Opacity"
              min={0}
              max={100}
              value={effects.overlay.opacity}
              onChange={(value) => handleEffectChange('overlay', { opacity: value })}
            />
          </div>
        )}
      </div>

      {/* Preview */}
      <div
        className={`
          p-4
          border-t
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        <div
          className={`
            aspect-video
            rounded-lg
            overflow-hidden
            ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
          `}
        >
          {selectedClip && (
            <div
              className="w-full h-full"
              style={{
                filter: effects.filter.type !== 'none'
                  ? `${effects.filter.type}(${effects.filter.intensity}%)`
                  : undefined,
              }}
            >
              {/* Preview content */}
              <div className="w-full h-full relative">
                {/* Clip content would go here */}
                
                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: effects.overlay.color,
                    opacity: effects.overlay.opacity / 100,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
