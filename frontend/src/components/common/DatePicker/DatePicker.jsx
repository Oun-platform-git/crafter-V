import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  format = 'MM/dd/yyyy',
  minDate,
  maxDate,
  disabled = false,
  error,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState(value);
  const pickerRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return format
      .replace('MM', month)
      .replace('dd', day)
      .replace('yyyy', year);
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (
      (!minDate || newDate >= minDate) &&
      (!maxDate || newDate <= maxDate)
    ) {
      setSelectedDate(newDate);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];
    
    // Previous month days
    const prevMonthDays = getDaysInMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          className={`
            p-2
            text-center
            ${isDark ? 'text-gray-600' : 'text-gray-400'}
            hover:bg-gray-100
            dark:hover:bg-gray-800
            rounded-lg
          `}
          disabled
        >
          {prevMonthDays - i}
        </button>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isDisabled = 
        (minDate && date < minDate) ||
        (maxDate && date > maxDate);

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(day)}
          className={`
            p-2
            text-center
            rounded-lg
            transition-colors
            ${isSelected
              ? isDark
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
              : isDark
              ? 'text-gray-300 hover:bg-gray-800'
              : 'text-gray-700 hover:bg-gray-100'
            }
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <button
          key={`next-${i}`}
          className={`
            p-2
            text-center
            ${isDark ? 'text-gray-600' : 'text-gray-400'}
            hover:bg-gray-100
            dark:hover:bg-gray-800
            rounded-lg
          `}
          disabled
        >
          {i}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
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

      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full
          px-3
          py-2
          text-left
          rounded-lg
          border
          ${error
            ? isDark
              ? 'border-red-500'
              : 'border-red-500'
            : isDark
            ? 'border-gray-700'
            : 'border-gray-300'
          }
          ${isDark ? 'bg-gray-800' : 'bg-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {selectedDate ? formatDate(selectedDate) : (
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {placeholder}
          </span>
        )}
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {isOpen && (
        <div
          className={`
            absolute
            z-50
            mt-2
            p-4
            rounded-lg
            shadow-lg
            ${isDark ? 'bg-gray-900' : 'bg-white'}
            ${isDark ? 'border border-gray-800' : 'border border-gray-200'}
            animate-scaleIn
            origin-top-left
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
              className={`
                p-1
                rounded-lg
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                transition-colors
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <select
                value={viewDate.getMonth()}
                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value)))}
                className={`
                  py-1
                  px-2
                  rounded-lg
                  ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
                  ${isDark ? 'text-gray-200' : 'text-gray-700'}
                  border-none
                  focus:outline-none
                  cursor-pointer
                `}
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>

              <select
                value={viewDate.getFullYear()}
                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth()))}
                className={`
                  py-1
                  px-2
                  rounded-lg
                  ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
                  ${isDark ? 'text-gray-200' : 'text-gray-700'}
                  border-none
                  focus:outline-none
                  cursor-pointer
                `}
              >
                {Array.from({ length: 10 }, (_, i) => viewDate.getFullYear() - 5 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
              className={`
                p-1
                rounded-lg
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                transition-colors
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div
                key={day}
                className={`
                  text-center
                  text-sm
                  font-medium
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                `}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Today button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                handleDateSelect(today.getDate());
              }}
              className={`
                px-4
                py-2
                text-sm
                rounded-lg
                ${isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
                transition-colors
              `}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
