import { FC } from 'react';
import { AnimatableProperty } from './Timeline';

interface Vector2D {
  x: number;
  y: number;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface Gradient {
  type: 'linear' | 'radial';
  angle?: number;
  stops: { color: string; position: number }[];
}

interface PropertyEditorProps {
  property: AnimatableProperty;
  value: number | string | Vector2D | Vector3D | Gradient;
  onChange: (value: number | string | Vector2D | Vector3D | Gradient) => void;
}

const PropertyEditor: FC<PropertyEditorProps> = ({ property, value, onChange }) => {
  const handleNumberChange = (newValue: number) => {
    if (property.min !== undefined) {
      newValue = Math.max(property.min, newValue);
    }
    if (property.max !== undefined) {
      newValue = Math.min(property.max, newValue);
    }
    onChange(newValue);
  };

  switch (property.type) {
    case 'number':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={property.min ?? 0}
            max={property.max ?? 100}
            step={property.step ?? 0.1}
            value={value as number}
            onChange={(e) => handleNumberChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={value as number}
            step={property.step ?? 0.1}
            onChange={(e) => handleNumberChange(parseFloat(e.target.value))}
            className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
          />
          {property.unit && (
            <span className="text-gray-400 text-sm">{property.unit}</span>
          )}
        </div>
      );

    case 'color':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-sm"
            placeholder="#RRGGBB"
          />
        </div>
      );

    case 'gradient':
      const gradient = value as Gradient;
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <select
              value={gradient.type}
              onChange={(e) => onChange({ ...gradient, type: e.target.value as 'linear' | 'radial' })}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
            {gradient.type === 'linear' && (
              <input
                type="number"
                value={gradient.angle ?? 0}
                onChange={(e) => onChange({ ...gradient, angle: parseFloat(e.target.value) })}
                className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
                placeholder="Angle"
              />
            )}
          </div>
          <div className="space-y-1">
            {gradient.stops.map((stop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => {
                    const newStops = [...gradient.stops];
                    newStops[index] = { ...stop, color: e.target.value };
                    onChange({ ...gradient, stops: newStops });
                  }}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position * 100}
                  onChange={(e) => {
                    const newStops = [...gradient.stops];
                    newStops[index] = { ...stop, position: parseFloat(e.target.value) / 100 };
                    onChange({ ...gradient, stops: newStops });
                  }}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    const newStops = gradient.stops.filter((_, i) => i !== index);
                    onChange({ ...gradient, stops: newStops });
                  }}
                  className="text-red-500 hover:text-red-400 px-2"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newStops = [...gradient.stops, { color: '#ffffff', position: 1 }];
                onChange({ ...gradient, stops: newStops });
              }}
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              + Add Color Stop
            </button>
          </div>
        </div>
      );

    case 'position':
      const pos = value as Vector2D;
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm w-6">X:</span>
            <input
              type="range"
              min={property.min ?? -100}
              max={property.max ?? 100}
              step={property.step ?? 1}
              value={pos.x}
              onChange={(e) => onChange({ ...pos, x: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={pos.x}
              step={property.step ?? 1}
              onChange={(e) => onChange({ ...pos, x: parseFloat(e.target.value) })}
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
            />
            {property.unit && (
              <span className="text-gray-400 text-sm">{property.unit}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm w-6">Y:</span>
            <input
              type="range"
              min={property.min ?? -100}
              max={property.max ?? 100}
              step={property.step ?? 1}
              value={pos.y}
              onChange={(e) => onChange({ ...pos, y: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={pos.y}
              step={property.step ?? 1}
              onChange={(e) => onChange({ ...pos, y: parseFloat(e.target.value) })}
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
            />
            {property.unit && (
              <span className="text-gray-400 text-sm">{property.unit}</span>
            )}
          </div>
        </div>
      );

    case 'position3d':
      const pos3d = value as Vector3D;
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm w-6">X:</span>
            <input
              type="range"
              min={property.min ?? -100}
              max={property.max ?? 100}
              step={property.step ?? 1}
              value={pos3d.x}
              onChange={(e) => onChange({ ...pos3d, x: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={pos3d.x}
              step={property.step ?? 1}
              onChange={(e) => onChange({ ...pos3d, x: parseFloat(e.target.value) })}
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm w-6">Y:</span>
            <input
              type="range"
              min={property.min ?? -100}
              max={property.max ?? 100}
              step={property.step ?? 1}
              value={pos3d.y}
              onChange={(e) => onChange({ ...pos3d, y: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={pos3d.y}
              step={property.step ?? 1}
              onChange={(e) => onChange({ ...pos3d, y: parseFloat(e.target.value) })}
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm w-6">Z:</span>
            <input
              type="range"
              min={property.min ?? -100}
              max={property.max ?? 100}
              step={property.step ?? 1}
              value={pos3d.z}
              onChange={(e) => onChange({ ...pos3d, z: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={pos3d.z}
              step={property.step ?? 1}
              onChange={(e) => onChange({ ...pos3d, z: parseFloat(e.target.value) })}
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
            />
          </div>
          {property.unit && (
            <div className="text-right text-gray-400 text-sm">{property.unit}</div>
          )}
        </div>
      );

    case 'scale':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={property.min ?? 0}
            max={property.max ?? 2}
            step={property.step ?? 0.01}
            value={value as number}
            onChange={(e) => handleNumberChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={value as number}
            step={property.step ?? 0.01}
            onChange={(e) => handleNumberChange(parseFloat(e.target.value))}
            className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-400 text-sm">×</span>
        </div>
      );

    case 'rotation':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={property.min ?? 0}
            max={property.max ?? 360}
            step={property.step ?? 1}
            value={value as number}
            onChange={(e) => handleNumberChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={value as number}
            step={property.step ?? 1}
            onChange={(e) => handleNumberChange(parseFloat(e.target.value))}
            className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-400 text-sm">°</span>
        </div>
      );

    case 'bezier':
      const pos2d = value as Vector2D;
      return (
        <div className="relative h-40 bg-gray-900 rounded">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width * 100;
                const y = (1 - (e.clientY - rect.top) / rect.height) * 100;
                onChange({ x, y });
              }
            }}
          >
            <line x1="0" y1="0" x2="100" y2="100" stroke="#4B5563" strokeWidth="1" />
            <circle
              cx={pos2d.x}
              cy={100 - pos2d.y}
              r="4"
              fill="#3B82F6"
              className="cursor-pointer"
            />
          </svg>
        </div>
      );

    default:
      return null;
  }
};

export default PropertyEditor;
