import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Menu({
  trigger,
  items,
  position = 'bottom',
  align = 'start',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignments = {
    start: position === 'left' || position === 'right' ? 'top-0' : 'left-0',
    center:
      position === 'left' || position === 'right'
        ? 'top-1/2 -translate-y-1/2'
        : 'left-1/2 -translate-x-1/2',
    end:
      position === 'left' || position === 'right' ? 'bottom-0' : 'right-0',
  };

  const handleItemClick = (item) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute
            z-50
            min-w-[12rem]
            ${positions[position]}
            ${alignments[align]}
            rounded-lg
            shadow-lg
            ${isDark ? 'bg-gray-900' : 'bg-white'}
            ${isDark ? 'border border-gray-800' : 'border border-gray-200'}
            py-1
            animate-scaleIn
            origin-top-left
            ${className}
          `}
          role="menu"
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
                  onClick={() => handleItemClick(item)}
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
                  role="menuitem"
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
        </div>
      )}
    </div>
  );
}
