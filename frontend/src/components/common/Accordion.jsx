import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isDark } = useTheme();

  return (
    <div
      className={`
        border-b
        ${isDark ? 'border-gray-800' : 'border-gray-200'}
        ${className}
      `}
    >
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full
          py-4
          px-4
          flex
          items-center
          justify-between
          ${isDark ? 'text-gray-200' : 'text-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${!disabled && (isDark
            ? 'hover:bg-gray-800/50'
            : 'hover:bg-gray-50'
          )}
          transition-colors
          duration-200
        `}
      >
        <div className="flex items-center space-x-3">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-left">{title}</span>
          {badge && (
            <span
              className={`
                px-2
                py-0.5
                text-xs
                rounded-full
                ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
                ${isDark ? 'text-gray-300' : 'text-gray-700'}
              `}
            >
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`
            w-5
            h-5
            transform
            transition-transform
            duration-200
            ${isOpen ? 'rotate-180' : ''}
            ${isDark ? 'text-gray-400' : 'text-gray-500'}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`
          overflow-hidden
          transition-all
          duration-200
          ease-in-out
          ${isOpen ? 'max-h-96' : 'max-h-0'}
        `}
      >
        <div className="p-4 space-y-2">{children}</div>
      </div>
    </div>
  );
}

export default function Accordion({ children, className = '' }) {
  return (
    <div
      className={`
        rounded-lg
        border
        divide-y
        ${className}
      `}
    >
      {children}
    </div>
  );
}
