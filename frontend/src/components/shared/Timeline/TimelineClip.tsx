import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { VideoClip } from './Timeline';
import { Transition } from './TransitionEditor';
import AudioWaveform from './AudioWaveform';

interface TimelineClipProps {
  clip: VideoClip;
  index: number;
  isSelected: boolean;
  pixelsPerSecond: number;
  onMove: (targetIndex: number) => void;
  onTrim: (clipId: string, startTime: number, endTime: number) => void;
  onClick: () => void;
  disabled?: boolean;
  transition?: Transition;
  onTransitionChange?: (transition: Transition) => void;
  onTransitionRemove?: () => void;
  currentTime?: number;
}

const TimelineClip: FC<TimelineClipProps> = ({
  clip,
  index,
  isSelected,
  pixelsPerSecond,
  onMove,
  onTrim,
  onClick,
  disabled = false,
  transition,
  currentTime = 0
}) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'clip',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: !disabled,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        onMove(item.index);
      }
    }
  });

  const handleTrimStart = (e: React.MouseEvent, isStart: boolean) => {
    e.stopPropagation();
    if (disabled) return;

    const startX = e.clientX;
    const startTime = isStart ? clip.startTime : clip.startTime + clip.duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaTime = deltaX / pixelsPerSecond;
      const newTime = Math.max(0, startTime + deltaTime);

      if (isStart) {
        const maxStartTime = clip.startTime + clip.duration - 0.1;
        onTrim(clip.id, Math.min(newTime, maxStartTime), clip.startTime + clip.duration);
      } else {
        const minEndTime = clip.startTime + 0.1;
        onTrim(clip.id, clip.startTime, Math.max(newTime, minEndTime));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const clipWidth = clip.duration * pixelsPerSecond;
  const clipLeft = clip.startTime * pixelsPerSecond;

  return (
    <div
      ref={dragRef}
      className={`absolute h-full rounded overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' :
        isDragging ? 'opacity-50' : 'cursor-pointer'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
        backgroundColor: clip.type === 'video' ? '#2563EB' :
                        clip.type === 'audio' ? '#059669' :
                        clip.type === 'text' ? '#7C3AED' : '#D97706'
      }}
      onClick={onClick}
    >
      {/* Clip content */}
      <div className="h-full p-2 flex items-center">
        {clip.type === 'audio' ? (
          <AudioWaveform
            audioUrl={clip.url}
            width={clipWidth - 8}
            height={40}
            progress={(currentTime - clip.startTime) / clip.duration}
          />
        ) : (
          <>
            {clip.thumbnail && (
              <img
                src={clip.thumbnail}
                alt=""
                className="h-full w-12 object-cover rounded mr-2"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs text-white">
                {clip.effects.length > 0 && (
                  <span className="mr-1 text-yellow-400">✨</span>
                )}
                {clip.type === 'text' && '📝 '}
                {clip.type === 'effect' && '🎨 '}
                {clip.url.split('/').pop()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transition indicator */}
      {transition && (
        <div
          className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-purple-500 rounded-bl text-white text-xs"
          title={`${transition.type} transition (${transition.duration}s)`}
        >
          {transition.type === 'fade' ? '🌓' :
           transition.type === 'slide' ? '↔️' :
           transition.type === 'zoom' ? '🔍' :
           transition.type === 'wipe' ? '⬅️' : '✨'}
        </div>
      )}

      {/* Trim handles */}
      {!disabled && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-25"
            onMouseDown={(e) => handleTrimStart(e, true)}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-25"
            onMouseDown={(e) => handleTrimStart(e, false)}
          />
        </>
      )}
    </div>
  );
};

export default TimelineClip;
