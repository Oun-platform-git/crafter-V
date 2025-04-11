import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  showValue = true,
  disabled = false,
  marks = [],
  vertical = false,
  size = 'md',
  color = 'primary',
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const colors = {
    primary: isDark ? 'bg-blue-500' : 'bg-blue-600',
    secondary: isDark ? 'bg-purple-500' : 'bg-purple-600',
    success: isDark ? 'bg-green-500' : 'bg-green-600',
    warning: isDark ? 'bg-yellow-500' : 'bg-yellow-600',
    error: isDark ? 'bg-red-500' : 'bg-red-600',
  };

  const sizes = {
    sm: {
      track: 'h-1',
      thumb: 'w-3 h-3',
      vertical: 'w-1',
    },
    md: {
      track: 'h-2',
      thumb: 'w-4 h-4',
      vertical: 'w-2',
    },
    lg: {
      track: 'h-3',
      thumb: 'w-5 h-5',
      vertical: 'w-3',
    },
  };

  const getPercentage = (value) => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    let percentage;

    if (vertical) {
      percentage = 1 - (e.clientY - rect.top) / rect.height;
    } else {
      percentage = (e.clientX - rect.left) / rect.width;
    }

    percentage = Math.min(1, Math.max(0, percentage));
    const newValue = Math.round((percentage * (max - min) + min) / step) * step;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className={`
        ${vertical ? 'h-40' : ''}
        ${className}
      `}
    >
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            className={`
              text-sm
              font-medium
              ${isDark ? 'text-gray-200' : 'text-gray-700'}
            `}
          >
            {label}
          </label>
          {showValue && (
            <span
              className={`
                text-sm
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}
            >
              {localValue}
            </span>
          )}
        </div>
      )}

      <div
        ref={sliderRef}
        className={`
          relative
          ${vertical ? 'h-full flex items-center' : 'w-full'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`
            rounded-full
            ${vertical ? sizes[size].vertical : sizes[size].track}
            ${vertical ? 'h-full' : 'w-full'}
            ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
          `}
        >
          <div
            className={`
              absolute
              rounded-full
              ${colors[color]}
              ${vertical ? sizes[size].vertical : sizes[size].track}
              transition-all
              duration-150
            `}
            style={{
              [vertical ? 'height' : 'width']: `${getPercentage(localValue)}%`,
              [vertical ? 'bottom' : 'left']: 0,
            }}
          />
        </div>

        <div
          className={`
            absolute
            rounded-full
            ${sizes[size].thumb}
            ${colors[color]}
            shadow
            transform
            -translate-x-1/2
            ${vertical ? '-translate-y-1/2' : '-translate-y-1/2'}
            transition-all
            duration-150
            ${disabled ? '' : 'hover:ring-4 hover:ring-blue-500/20'}
          `}
          style={{
            [vertical ? 'left' : 'left']: `${getPercentage(localValue)}%`,
            [vertical ? 'bottom' : 'top']: vertical ? `${getPercentage(localValue)}%` : '50%',
          }}
        />

        {marks.map((mark) => (
          <div
            key={mark.value}
            className={`
              absolute
              ${vertical ? 'w-4' : 'h-4'}
              flex
              items-center
              justify-center
              ${vertical ? '-left-5' : 'top-5'}
            `}
            style={{
              [vertical ? 'bottom' : 'left']: `${getPercentage(mark.value)}%`,
            }}
          >
            <div
              className={`
                w-1
                h-1
                rounded-full
                ${isDark ? 'bg-gray-500' : 'bg-gray-400'}
              `}
            />
            {mark.label && (
              <span
                className={`
                  text-xs
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  ${vertical ? 'ml-2' : 'mt-1'}
                `}
              >
                {mark.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
