import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className = '',
}) {
  const { isDark } = useTheme();

  const sizes = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`
          ${sizes[size].switch}
          flex
          items-center
          rounded-full
          cursor-pointer
          transition-colors
          duration-200
          ${
            checked
              ? 'bg-blue-600'
              : isDark
              ? 'bg-gray-700'
              : 'bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          peer-focus:outline-none
          peer-focus:ring-4
          peer-focus:ring-blue-300/25
        `}
      >
        <div
          className={`
            ${sizes[size].thumb}
            transform
            rounded-full
            transition-transform
            duration-200
            ${isDark ? 'bg-white' : 'bg-white'}
            ${checked ? sizes[size].translate : 'translate-x-1'}
            shadow-sm
          `}
        ></div>
      </div>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <div
              className={`
                text-sm
                font-medium
                ${isDark ? 'text-gray-300' : 'text-gray-900'}
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {label}
            </div>
          )}
          {description && (
            <div
              className={`
                text-sm
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {description}
            </div>
          )}
        </div>
      )}
    </label>
  );
}
