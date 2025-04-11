import React from 'react';
import { theme } from '../../styles/theme';

const variants = {
  primary: {
    base: `
      bg-gray-800
      border-gray-700
      focus:border-blue-500
      focus:ring-blue-500/20
      placeholder-gray-400
    `,
    error: `
      bg-gray-800
      border-red-500
      focus:border-red-500
      focus:ring-red-500/20
      placeholder-red-300
    `,
  },
  secondary: {
    base: `
      bg-gray-900
      border-gray-800
      focus:border-purple-500
      focus:ring-purple-500/20
      placeholder-gray-500
    `,
    error: `
      bg-gray-900
      border-red-500
      focus:border-red-500
      focus:ring-red-500/20
      placeholder-red-300
    `,
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
};

export default function Input({
  type = 'text',
  variant = 'primary',
  size = 'md',
  error,
  label,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseClasses = `
    block
    text-white
    border
    rounded-lg
    transition-colors
    duration-200
    focus:outline-none
    focus:ring-4
    disabled:opacity-60
    disabled:cursor-not-allowed
  `;

  const variantClasses = error
    ? variants[variant].error
    : variants[variant].base;
  const sizeClasses = sizes[size];
  const widthClasses = fullWidth ? 'w-full' : '';
  const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  return (
    <div className={`${widthClasses}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          type={type}
          className={`
            ${baseClasses}
            ${variantClasses}
            ${sizeClasses}
            ${widthClasses}
            ${iconClasses}
            ${className}
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${
            error ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
