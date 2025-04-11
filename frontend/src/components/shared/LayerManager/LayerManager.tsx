import React, { FC, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layer from './Layer';

export interface VideoLayer {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  visible: boolean;
  locked: boolean;
  clips: Array<{
    id: string;
    startTime: number;
    duration: number;
    content: any;
  }>;
}

interface LayerManagerProps {
  layers: VideoLayer[];
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onLayerLockChange: (layerId: string, locked: boolean) => void;
  onLayerMove: (fromIndex: number, toIndex: number) => void;
  onLayerSelect: (layerId: string) => void;
  selectedLayerId?: string;
  currentTime: number;
}

const LayerManager: FC<LayerManagerProps> = ({
  layers,
  onLayerVisibilityChange,
  onLayerLockChange,
  onLayerMove,
  onLayerSelect,
  selectedLayerId,
  currentTime
}) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const toggleLayerExpand = (layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg">
        {/* Layer controls header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h3 className="text-white font-medium">Layers</h3>
          <button
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm"
            onClick={() => {
              // Add new layer logic
            }}
          >
            Add Layer
          </button>
        </div>

        {/* Layers list */}
        <div className="divide-y divide-gray-700">
          {layers.map((layer, index) => (
            <Layer
              key={layer.id}
              layer={layer}
              index={index}
              isExpanded={expandedLayers.has(layer.id)}
              isSelected={layer.id === selectedLayerId}
              currentTime={currentTime}
              onToggleExpand={() => toggleLayerExpand(layer.id)}
              onVisibilityChange={(visible) => onLayerVisibilityChange(layer.id, visible)}
              onLockChange={(locked) => onLayerLockChange(layer.id, locked)}
              onSelect={() => onLayerSelect(layer.id)}
              onMove={onLayerMove}
            />
          ))}
        </div>

        {/* Layer properties */}
        {selectedLayerId && (
          <div className="border-t border-gray-700 p-3">
            <h4 className="text-sm text-gray-400 mb-2">Layer Properties</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-32"
                  // Add opacity handling
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Blend Mode</span>
                <select className="bg-gray-800 text-white text-sm rounded border border-gray-700 px-2 py-1">
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default LayerManager;
