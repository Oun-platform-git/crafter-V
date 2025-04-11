import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}) {
  const { isDark } = useTheme();

  const variants = {
    primary: {
      solid: `
        ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}
        ${isDark ? 'ring-blue-800' : 'ring-blue-200'}
      `,
      outline: `
        ${isDark ? 'text-blue-300 ring-1 ring-blue-800' : 'text-blue-700 ring-1 ring-blue-200'}
      `,
    },
    secondary: {
      solid: `
        ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}
        ${isDark ? 'ring-purple-800' : 'ring-purple-200'}
      `,
      outline: `
        ${isDark ? 'text-purple-300 ring-1 ring-purple-800' : 'text-purple-700 ring-1 ring-purple-200'}
      `,
    },
    success: {
      solid: `
        ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}
        ${isDark ? 'ring-green-800' : 'ring-green-200'}
      `,
      outline: `
        ${isDark ? 'text-green-300 ring-1 ring-green-800' : 'text-green-700 ring-1 ring-green-200'}
      `,
    },
    warning: {
      solid: `
        ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}
        ${isDark ? 'ring-yellow-800' : 'ring-yellow-200'}
      `,
      outline: `
        ${isDark ? 'text-yellow-300 ring-1 ring-yellow-800' : 'text-yellow-700 ring-1 ring-yellow-200'}
      `,
    },
    error: {
      solid: `
        ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}
        ${isDark ? 'ring-red-800' : 'ring-red-200'}
      `,
      outline: `
        ${isDark ? 'text-red-300 ring-1 ring-red-800' : 'text-red-700 ring-1 ring-red-200'}
      `,
    },
    gray: {
      solid: `
        ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}
        ${isDark ? 'ring-gray-700' : 'ring-gray-200'}
      `,
      outline: `
        ${isDark ? 'text-gray-300 ring-1 ring-gray-700' : 'text-gray-700 ring-1 ring-gray-200'}
      `,
    },
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const style = dot ? 'solid' : 'outline';

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-x-1.5
        rounded-full
        font-medium
        whitespace-nowrap
        ${variants[variant][style]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            rounded-full
            ${dotSizes[size]}
            ${isDark ? `bg-${variant}-400` : `bg-${variant}-500`}
          `}
        />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className={`
            -mr-1
            ml-1.5
            hover:opacity-75
            focus:outline-none
            transition-opacity
            duration-200
          `}
        >
          <svg
            className={`
              ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
