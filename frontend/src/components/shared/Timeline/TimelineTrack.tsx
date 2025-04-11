import React, { FC } from 'react';
import { useDrop } from 'react-dnd';

export interface TimelineTrackProps {
  children: React.ReactNode;
  height?: number;
  locked?: boolean;
  visible?: boolean;
}

const TimelineTrack: FC<TimelineTrackProps> = ({
  children,
  height = 80,
  locked = false,
  visible = true
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'clip',
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`relative border-b border-gray-700 ${!visible ? 'opacity-50' : ''} ${locked ? 'bg-gray-800/50' : ''} ${
        isOver ? 'border-2 border-blue-500' : ''
      }`}
      style={{ height: `${height}px` }}
    >
      {children}
    </div>
  );
};

export default TimelineTrack;
