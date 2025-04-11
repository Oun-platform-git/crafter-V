import React, { FC } from 'react';

interface TimelineCursorProps {
  currentTime: number;
  pixelsPerSecond: number;
}

const TimelineCursor: FC<TimelineCursorProps> = ({ currentTime, pixelsPerSecond }) => {
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none"
      style={{
        left: `${currentTime * pixelsPerSecond}px`,
        zIndex: 10,
      }}
    >
      <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
    </div>
  );
};

export default TimelineCursor;
