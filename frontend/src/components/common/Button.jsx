import React from 'react';
import { theme } from '../../styles/theme';

const variants = {
  primary: {
    base: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`,
    outlined: `border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10 focus:ring-blue-500`,
    ghost: `text-blue-600 hover:bg-blue-600/10 focus:ring-blue-500`,
  },
  secondary: {
    base: `bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`,
    outlined: `border-2 border-purple-600 text-purple-600 hover:bg-purple-600/10 focus:ring-purple-500`,
    ghost: `text-purple-600 hover:bg-purple-600/10 focus:ring-purple-500`,
  },
  success: {
    base: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`,
    outlined: `border-2 border-green-600 text-green-600 hover:bg-green-600/10 focus:ring-green-500`,
    ghost: `text-green-600 hover:bg-green-600/10 focus:ring-green-500`,
  },
  warning: {
    base: `bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`,
    outlined: `border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600/10 focus:ring-yellow-500`,
    ghost: `text-yellow-600 hover:bg-yellow-600/10 focus:ring-yellow-500`,
  },
  error: {
    base: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`,
    outlined: `border-2 border-red-600 text-red-600 hover:bg-red-600/10 focus:ring-red-500`,
    ghost: `text-red-600 hover:bg-red-600/10 focus:ring-red-500`,
  },
};

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

export default function Button({
  children,
  variant = 'primary',
  style = 'base',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  rounded = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const variantClasses = variants[variant][style];
  const sizeClasses = sizes[size];
  const iconSizeClasses = iconSizes[size];
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
        ${roundedClasses}
        ${widthClasses}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <svg
          className={`animate-spin -ml-1 mr-3 ${iconSizeClasses}`}
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
      ) : icon && iconPosition === 'left' ? (
        <span className={`mr-2 ${iconSizeClasses}`}>{icon}</span>
      ) : null}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={`ml-2 ${iconSizeClasses}`}>{icon}</span>
      )}
    </button>
  );
}
