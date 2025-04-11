import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Toast({
  title,
  message,
  type = 'info',
  duration = 5000,
  action,
  onClose,
}) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateProgress = () => {
        const now = Date.now();
        const remaining = endTime - now;
        const newProgress = (remaining / duration) * 100;

        if (newProgress <= 0) {
          handleClose();
        } else {
          setProgress(newProgress);
          requestAnimationFrame(updateProgress);
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const variants = {
    info: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      style: isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700',
      progress: isDark ? 'bg-blue-500' : 'bg-blue-600',
    },
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      style: isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700',
      progress: isDark ? 'bg-green-500' : 'bg-green-600',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      style: isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700',
      progress: isDark ? 'bg-yellow-500' : 'bg-yellow-600',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      style: isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700',
      progress: isDark ? 'bg-red-500' : 'bg-red-600',
    },
  };

  const currentVariant = variants[type];

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-lg
        shadow-lg
        ${currentVariant.style}
        ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}
        max-w-sm
        w-full
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentVariant.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium mb-1">{title}</p>
            )}
            <p className="text-sm opacity-90">{message}</p>
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-current opacity-50 hover:opacity-100 focus:outline-none transition-opacity duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {duration > 0 && (
        <div
          className={`
            absolute
            bottom-0
            left-0
            h-1
            transition-all
            duration-200
            ${currentVariant.progress}
          `}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
