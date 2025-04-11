import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Dropdown({
  trigger,
  items,
  position = 'bottom',
  align = 'left',
  width = 'w-48',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <div
        className={`
          absolute
          z-50
          ${positionClasses[position]}
          ${alignClasses[align]}
          ${width}
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
          transform
          transition-all
          duration-200
          origin-top-right
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          ${isDark ? 'border border-gray-800' : 'border border-gray-200'}
          rounded-lg
          shadow-lg
          ${className}
        `}
      >
        <div className="py-1">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`
                px-4
                py-2
                text-sm
                ${isDark ? 'text-gray-300' : 'text-gray-700'}
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                cursor-pointer
                flex
                items-center
                space-x-2
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${item.danger ? 'text-red-500 hover:text-red-600' : ''}
              `}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
