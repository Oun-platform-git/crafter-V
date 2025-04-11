import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Alert({
  title,
  message,
  variant = 'info',
  icon,
  action,
  dismissible = true,
  autoClose = 0,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  if (!isVisible) return null;

  const variants = {
    info: {
      bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      border: isDark ? 'border-blue-800' : 'border-blue-200',
      text: isDark ? 'text-blue-300' : 'text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    success: {
      bg: isDark ? 'bg-green-900/20' : 'bg-green-50',
      border: isDark ? 'border-green-800' : 'border-green-200',
      text: isDark ? 'text-green-300' : 'text-green-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
      border: isDark ? 'border-yellow-800' : 'border-yellow-200',
      text: isDark ? 'text-yellow-300' : 'text-yellow-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    error: {
      bg: isDark ? 'bg-red-900/20' : 'bg-red-50',
      border: isDark ? 'border-red-800' : 'border-red-200',
      text: isDark ? 'text-red-300' : 'text-red-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`
        relative
        p-4
        rounded-lg
        border
        ${currentVariant.bg}
        ${currentVariant.border}
        ${currentVariant.text}
        animate-slideIn
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icon || currentVariant.icon}
        </div>
        <div className="ml-3 w-full">
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h3 className="text-sm font-medium mb-1">{title}</h3>
              )}
              <div className="text-sm opacity-90">{message}</div>
            </div>
            {dismissible && (
              <button
                onClick={() => setIsVisible(false)}
                className={`
                  ml-4
                  -mt-1
                  -mr-1
                  p-1.5
                  rounded-lg
                  opacity-50
                  hover:opacity-100
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-2
                  ${isDark
                    ? 'hover:bg-gray-800 focus:ring-offset-gray-900'
                    : 'hover:bg-gray-100 focus:ring-offset-white'
                  }
                  ${currentVariant.text}
                  transition-opacity
                  duration-200
                `}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="w-4 h-4"
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
          </div>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
