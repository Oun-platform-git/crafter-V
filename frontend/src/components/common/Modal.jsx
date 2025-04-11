import React, { useEffect } from 'react';
import { theme } from '../../styles/theme';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlayClick = true,
  footer,
  className = '',
  ...props
}) {
  // Handle escape key press
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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative
            w-full
            ${sizes[size]}
            bg-gray-900
            rounded-lg
            shadow-xl
            transform
            transition-all
            ${className}
          `}
          {...props}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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
            <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
