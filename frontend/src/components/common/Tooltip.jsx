import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../../styles/theme';

export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);
  const timerRef = useRef(null);

  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        y = targetRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        y = targetRect.bottom + 8;
        break;
      case 'left':
        x = targetRect.left - tooltipRect.width - 8;
        y = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        break;
      case 'right':
        x = targetRect.right + 8;
        y = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        break;
    }

    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            fixed
            z-tooltip
            px-2
            py-1
            text-sm
            text-white
            bg-gray-900
            border
            border-gray-800
            rounded-md
            shadow-lg
            pointer-events-none
            transform
            transition-opacity
            duration-200
            ${className}
          `}
          style={{
            left: coords.x,
            top: coords.y,
          }}
          {...props}
        >
          {content}
          <div
            className={`
              absolute
              w-2
              h-2
              bg-gray-900
              border
              border-gray-800
              transform
              rotate-45
              ${
                position === 'top'
                  ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0'
                  : position === 'bottom'
                  ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0'
                  : position === 'left'
                  ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-l-0 border-b-0'
                  : 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-r-0 border-t-0'
              }
            `}
          ></div>
        </div>
      )}
    </>
  );
}
