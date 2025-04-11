import React from 'react';
import { theme } from '../../styles/theme';

export default function Card({
  children,
  variant = 'primary',
  hoverable = false,
  clickable = false,
  bordered = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = `
    rounded-lg
    transition-all
    duration-200
  `;

  const variants = {
    primary: `bg-gray-900 ${bordered ? 'border border-gray-800' : ''}`,
    secondary: `bg-gray-800 ${bordered ? 'border border-gray-700' : ''}`,
    elevated: `
      bg-gray-900
      ${bordered ? 'border border-gray-800' : ''}
      shadow-lg
      shadow-black/50
    `,
  };

  const interactionClasses = `
    ${hoverable ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50' : ''}
    ${clickable ? 'cursor-pointer active:scale-[0.98]' : ''}
  `;

  return (
    <div
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${interactionClasses}
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
