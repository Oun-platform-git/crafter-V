import React, { FC, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { VideoLayer } from './LayerManager';

interface LayerProps {
  layer: VideoLayer;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  currentTime: number;
  onToggleExpand: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onLockChange: (locked: boolean) => void;
  onSelect: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const Layer: FC<LayerProps> = ({
  layer,
  index,
  isExpanded,
  isSelected,
  currentTime,
  onToggleExpand,
  onVisibilityChange,
  onLockChange,
  onSelect,
  onMove,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'layer',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y || 0) - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'layer',
    item: () => {
      return { id: layer.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !layer.locked,
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const getLayerIcon = (type: VideoLayer['type']) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'audio':
        return '🔊';
      case 'text':
        return '📝';
      case 'effect':
        return '✨';
      default:
        return '📄';
    }
  };

  return (
    <div
      ref={ref}
      className={`
        p-3 select-none cursor-pointer
        ${isSelected ? 'bg-gray-800' : 'hover:bg-gray-800'}
        ${layer.locked ? 'opacity-50' : ''}
      `}
      style={{ opacity }}
      onClick={onSelect}
      data-handler-id={handlerId}
    >
      <div className="flex items-center space-x-3">
        {/* Expand/collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {/* Layer icon */}
        <span className="text-xl">{getLayerIcon(layer.type)}</span>

        {/* Layer name */}
        <span className="text-white flex-grow">{layer.name}</span>

        {/* Layer controls */}
        <div className="flex items-center space-x-2">
          {/* Visibility toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVisibilityChange(!layer.visible);
            }}
            className={`p-1 rounded hover:bg-gray-700 ${
              layer.visible ? 'text-white' : 'text-gray-500'
            }`}
          >
            {layer.visible ? '👁️' : '👁️‍🗨️'}
          </button>

          {/* Lock toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLockChange(!layer.locked);
            }}
            className={`p-1 rounded hover:bg-gray-700 ${
              layer.locked ? 'text-white' : 'text-gray-500'
            }`}
          >
            {layer.locked ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-2 pl-8">
          {layer.clips.map((clip) => (
            <div
              key={clip.id}
              className="flex items-center space-x-2 py-1 text-sm text-gray-400"
            >
              <span>📎</span>
              <span className="flex-grow">Clip {clip.id}</span>
              <span>{clip.duration}s</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Layer;
