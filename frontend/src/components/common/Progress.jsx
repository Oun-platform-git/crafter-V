import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Progress({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = false,
  className = '',
}) {
  const { isDark } = useTheme();

  const variants = {
    primary: {
      bar: 'bg-blue-500',
      track: isDark ? 'bg-gray-800' : 'bg-gray-200',
    },
    secondary: {
      bar: 'bg-purple-500',
      track: isDark ? 'bg-gray-800' : 'bg-gray-200',
    },
    success: {
      bar: 'bg-green-500',
      track: isDark ? 'bg-gray-800' : 'bg-gray-200',
    },
    warning: {
      bar: 'bg-yellow-500',
      track: isDark ? 'bg-gray-800' : 'bg-gray-200',
    },
    error: {
      bar: 'bg-red-500',
      track: isDark ? 'bg-gray-800' : 'bg-gray-200',
    },
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span
            className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Progress
          </span>
          <span
            className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}

      <div
        className={`
          w-full
          rounded-full
          ${variants[variant].track}
          ${sizes[size]}
        `}
      >
        <div
          className={`
            rounded-full
            ${variants[variant].bar}
            ${sizes[size]}
            transition-all
            duration-300
            ${
              animated
                ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent'
                : ''
            }
          `}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
