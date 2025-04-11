import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function TransitionPreview({
  type,
  duration = 1,
  fromClip,
  toClip,
  isPlaying = false,
  onComplete,
  className = '',
}) {
  const [progress, setProgress] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    let animationFrame;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min(1, elapsed / (duration * 1000));

      setProgress(newProgress);

      if (newProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    if (isPlaying) {
      setProgress(0);
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, duration, onComplete]);

  const getTransitionStyles = () => {
    const baseStyles = {
      position: 'absolute',
      inset: 0,
      transition: `all ${duration}s ease-in-out`,
    };

    switch (type) {
      case 'fade':
        return {
          from: {
            ...baseStyles,
            opacity: 1 - progress,
          },
          to: {
            ...baseStyles,
            opacity: progress,
          },
        };

      case 'slide':
        return {
          from: {
            ...baseStyles,
            transform: `translateX(${-100 * progress}%)`,
          },
          to: {
            ...baseStyles,
            transform: `translateX(${100 - 100 * progress}%)`,
          },
        };

      case 'zoom':
        return {
          from: {
            ...baseStyles,
            transform: `scale(${1 - progress})`,
            opacity: 1 - progress,
          },
          to: {
            ...baseStyles,
            transform: `scale(${progress})`,
            opacity: progress,
          },
        };

      case 'wipe':
        return {
          from: {
            ...baseStyles,
            clipPath: `inset(0 ${progress * 100}% 0 0)`,
          },
          to: {
            ...baseStyles,
            clipPath: `inset(0 0 0 ${(1 - progress) * 100}%)`,
          },
        };

      case 'dissolve':
        return {
          from: {
            ...baseStyles,
            opacity: 1 - progress,
            filter: `blur(${progress * 8}px)`,
          },
          to: {
            ...baseStyles,
            opacity: progress,
            filter: `blur(${(1 - progress) * 8}px)`,
          },
        };

      default:
        return {
          from: baseStyles,
          to: baseStyles,
        };
    }
  };

  const styles = getTransitionStyles();

  return (
    <div
      className={`
        relative
        overflow-hidden
        ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
        rounded-lg
        ${className}
      `}
      style={{ aspectRatio: '16/9' }}
    >
      {/* From clip */}
      <div style={styles.from}>
        {fromClip || (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`text-4xl ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>A</span>
          </div>
        )}
      </div>

      {/* To clip */}
      <div style={styles.to}>
        {toClip || (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`text-4xl ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>B</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          bg-blue-500
          transition-all
          duration-100
        `}
        style={{ width: `${progress * 100}%` }}
      />

      {/* Play indicator */}
      {isPlaying && (
        <div
          className={`
            absolute
            top-2
            right-2
            w-3
            h-3
            rounded-full
            bg-red-500
            animate-pulse
          `}
        />
      )}
    </div>
  );
}
