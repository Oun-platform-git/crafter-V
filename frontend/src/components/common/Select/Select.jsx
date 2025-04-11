import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  multiple = false,
  clearable = false,
  loading = false,
  error,
  label,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      const index = newValue.findIndex((v) => v.value === option.value);
      
      if (index === -1) {
        onChange([...newValue, option]);
      } else {
        onChange(newValue.filter((_, i) => i !== index));
      }
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const isSelected = (option) => {
    if (multiple) {
      return (value || []).some((v) => v.value === option.value);
    }
    return value?.value === option.value;
  };

  return (
    <div className={className}>
      {label && (
        <label
          className={`
            block
            text-sm
            font-medium
            mb-1
            ${isDark ? 'text-gray-200' : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            relative
            w-full
            min-h-[2.5rem]
            px-3
            py-2
            rounded-lg
            border
            ${error
              ? isDark
                ? 'border-red-500 focus-within:ring-red-500/20'
                : 'border-red-500 focus-within:ring-red-500/20'
              : isDark
              ? 'border-gray-700 focus-within:border-blue-500 focus-within:ring-blue-500/20'
              : 'border-gray-300 focus-within:border-blue-600 focus-within:ring-blue-600/20'
            }
            ${isDark ? 'bg-gray-800' : 'bg-white'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus-within:ring-4
            transition-all
            duration-200
          `}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {multiple ? (
              (value || []).length > 0 ? (
                (value || []).map((v) => (
                  <span
                    key={v.value}
                    className={`
                      inline-flex
                      items-center
                      gap-1
                      px-2
                      py-1
                      text-sm
                      rounded-md
                      ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
                      ${isDark ? 'text-gray-200' : 'text-gray-700'}
                    `}
                  >
                    {v.label}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(v);
                      }}
                      className="hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {placeholder}
                </span>
              )
            ) : value ? (
              <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                {value.label}
              </span>
            ) : (
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {placeholder}
              </span>
            )}
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <svg
                className={`
                  animate-spin
                  h-4
                  w-4
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                `}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            
            {clearable && (value || (multiple && value?.length > 0)) && (
              <button
                onClick={handleClear}
                className={`
                  p-1
                  rounded-full
                  hover:bg-gray-200
                  dark:hover:bg-gray-700
                  transition-colors
                `}
              >
                ×
              </button>
            )}

            <svg
              className={`
                w-4
                h-4
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
          </div>
        </div>

        {isOpen && (
          <div
            className={`
              absolute
              z-50
              w-full
              mt-2
              rounded-lg
              shadow-lg
              ${isDark ? 'bg-gray-800' : 'bg-white'}
              ${isDark ? 'border border-gray-700' : 'border border-gray-200'}
              py-1
              animate-scaleIn
              origin-top
            `}
          >
            {searchable && (
              <div className="px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full
                    px-2
                    py-1
                    text-sm
                    rounded-md
                    ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
                    ${isDark ? 'text-gray-200' : 'text-gray-900'}
                    focus:outline-none
                  `}
                  placeholder="Search..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-3
                      py-2
                      cursor-pointer
                      flex
                      items-center
                      gap-2
                      ${
                        isSelected(option)
                          ? isDark
                            ? 'bg-gray-700 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                          : isDark
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {multiple && (
                      <div
                        className={`
                          w-4
                          h-4
                          rounded
                          border
                          flex
                          items-center
                          justify-center
                          ${
                            isSelected(option)
                              ? isDark
                                ? 'border-blue-400 bg-blue-400'
                                : 'border-blue-600 bg-blue-600'
                              : isDark
                              ? 'border-gray-600'
                              : 'border-gray-300'
                          }
                        `}
                      >
                        {isSelected(option) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    {option.icon && (
                      <span className="w-5 h-5">{option.icon}</span>
                    )}
                    {option.label}
                  </div>
                ))
              ) : (
                <div
                  className={`
                    px-3
                    py-2
                    text-sm
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}
                >
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
