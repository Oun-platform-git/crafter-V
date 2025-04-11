import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}) {
  const dialogRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full mx-4',
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`
          fixed
          inset-0
          bg-black/50
          backdrop-blur-sm
          transition-opacity
          duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={dialogRef}
            className={`
              w-full
              ${sizes[size]}
              ${isDark ? 'bg-gray-900' : 'bg-white'}
              ${isDark ? 'border border-gray-800' : 'border border-gray-200'}
              rounded-lg
              shadow-xl
              transform
              transition-all
              duration-300
              ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
          >
            {/* Header */}
            {(title || showCloseButton) && (
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
                {title && (
                  <div>
                    <h2
                      id="dialog-title"
                      className={`
                        text-lg
                        font-semibold
                        ${isDark ? 'text-white' : 'text-gray-900'}
                      `}
                    >
                      {title}
                    </h2>
                    {description && (
                      <p
                        id="dialog-description"
                        className={`
                          mt-1
                          text-sm
                          ${isDark ? 'text-gray-400' : 'text-gray-500'}
                        `}
                      >
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`
                      p-1
                      rounded-lg
                      ${isDark
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }
                      transition-colors
                      duration-200
                    `}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="w-5 h-5"
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
            )}

            {/* Content */}
            <div className="p-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div
                className={`
                  flex
                  justify-end
                  gap-2
                  p-4
                  border-t
                  ${isDark ? 'border-gray-800' : 'border-gray-200'}
                `}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
