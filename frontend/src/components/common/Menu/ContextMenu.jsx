import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ContextMenu({
  items,
  onClose,
  x,
  y,
  className = '',
}) {
  const [position, setPosition] = useState({ x, y });
  const { isDark } = useTheme();

  const updatePosition = useCallback(() => {
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    const { innerWidth, innerHeight } = window;
    const { clientWidth, clientHeight } = menu;
    
    let newX = x;
    let newY = y;

    // Adjust horizontal position if menu would overflow
    if (x + clientWidth > innerWidth) {
      newX = innerWidth - clientWidth - 8;
    }

    // Adjust vertical position if menu would overflow
    if (y + clientHeight > innerHeight) {
      newY = innerHeight - clientHeight - 8;
    }

    setPosition({ x: newX, y: newY });
  }, [x, y]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    const handleClickOutside = (e) => {
      const menu = document.getElementById('context-menu');
      if (menu && !menu.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', onClose);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') onClose();
    });

    return () => {
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', onClose);
    };
  }, [onClose, updatePosition]);

  return createPortal(
    <div
      id="context-menu"
      className={`
        fixed
        z-50
        min-w-[12rem]
        rounded-lg
        shadow-lg
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        ${isDark ? 'border border-gray-800' : 'border border-gray-200'}
        py-1
        animate-scaleIn
        origin-top-left
        ${className}
      `}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.type === 'divider' ? (
            <div
              className={`
                my-1
                border-t
                ${isDark ? 'border-gray-800' : 'border-gray-200'}
              `}
            />
          ) : (
            <button
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.();
                  onClose();
                }
              }}
              className={`
                w-full
                px-4
                py-2
                text-sm
                text-left
                flex
                items-center
                gap-2
                ${
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : isDark
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }
                ${
                  item.danger
                    ? isDark
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-red-600 hover:text-red-700'
                    : isDark
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }
                transition-colors
                duration-150
              `}
              disabled={item.disabled}
            >
              {item.icon && (
                <span className="w-5 h-5 inline-flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span
                  className={`
                    ml-4
                    text-xs
                    ${isDark ? 'text-gray-500' : 'text-gray-400'}
                  `}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>,
    document.body
  );
}
