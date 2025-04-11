import React from 'react';

export default function Logo({ className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'text-xl',
    default: 'text-2xl',
    large: 'text-4xl'
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className} select-none`}>
      <span className="relative inline-block">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient opacity-75" />
        
        {/* Logo text with clip effect */}
        <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
          Crafter
        </span>
        
        {/* V with special styling */}
        <span className="relative inline-flex items-center">
          <span className="text-blue-500 font-black transform -skew-x-12 inline-block">V</span>
          {/* Decorative elements */}
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 transform -skew-x-12" />
          <span className="absolute -top-1 right-0 w-0.5 h-full bg-blue-500 transform -skew-x-12" />
        </span>
      </span>
    </div>
  );
}
