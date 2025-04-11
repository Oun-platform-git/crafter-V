import { FC, useState, useRef, useEffect } from 'react';
import { VideoClip, AnimatableProperty, Keyframe } from './Timeline';
import PropertyEditor from './PropertyEditor';
import { AnimationPreset as ImportedAnimationPreset } from './AnimationPresets';

type PropertyValue = string | number | { x: number; y: number } | { x: number; y: number; z: number } | {
  type: 'linear' | 'radial';
  angle?: number;
  stops: Array<{ color: string; position: number }>;
};

type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

interface AnimationPreset extends ImportedAnimationPreset {
  keyframes: Array<{
    time: number;
    properties: Record<string, { 
      value: PropertyValue;
      easing?: EasingType;
    }>;
  }>;
}

interface KeyframeEditorProps {
  clip: VideoClip;
  currentTime: number;
  pixelsPerSecond: number;
  onKeyframeAdd: (property: string, time: number, value: PropertyValue) => void;
  onKeyframeDelete: (property: string, keyframeId: string) => void;
  onKeyframeUpdate: (property: string, keyframeId: string, updates: Partial<Keyframe>) => void;
}

const KeyframeEditor: FC<KeyframeEditorProps> = ({
  clip,
  currentTime,
  pixelsPerSecond,
  onKeyframeAdd,
  onKeyframeDelete,
  onKeyframeUpdate,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [copiedKeyframes, setCopiedKeyframes] = useState<{
    property: string;
    keyframes: Keyframe[];
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getPropertyValue = (property: AnimatableProperty, time: number): PropertyValue => {
    const allKeyframes = Array.isArray(clip.keyframes) ? clip.keyframes : [];
    const keyframes = allKeyframes
      .filter((k: Keyframe) => k.properties[property.name])
      .sort((a: Keyframe, b: Keyframe) => a.time - b.time);

    const beforeKeyframe = keyframes
      .filter((k: Keyframe) => k.time <= time)
      .slice(-1)[0];
    const afterKeyframe = keyframes
      .find((k: Keyframe) => k.time > time);

    if (!beforeKeyframe) return afterKeyframe?.properties[property.name].value ?? property.default ?? 0;
    if (!afterKeyframe) return beforeKeyframe.properties[property.name].value;

    // Interpolate between keyframes
    const progress = (time - beforeKeyframe.time) / (afterKeyframe.time - beforeKeyframe.time);
    const beforeValue = beforeKeyframe.properties[property.name].value;
    const afterValue = afterKeyframe.properties[property.name].value;
    const easing = beforeKeyframe.properties[property.name].easing || 'linear';

    if (typeof beforeValue === 'number' && typeof afterValue === 'number') {
      return interpolateNumber(beforeValue, afterValue, progress, easing);
    }

    if (property.type === 'position' || property.type === 'bezier') {
      const before = beforeValue as { x: number; y: number };
      const after = afterValue as { x: number; y: number };
      return {
        x: interpolateNumber(before.x, after.x, progress, easing),
        y: interpolateNumber(before.y, after.y, progress, easing)
      };
    }

    if (property.type === 'position3d') {
      const before = beforeValue as { x: number; y: number; z: number };
      const after = afterValue as { x: number; y: number; z: number };
      return {
        x: interpolateNumber(before.x, after.x, progress, easing),
        y: interpolateNumber(before.y, after.y, progress, easing),
        z: interpolateNumber(before.z, after.z, progress, easing)
      };
    }

    if (property.type === 'gradient') {
      const before = beforeValue as { type: 'linear' | 'radial'; angle?: number; stops: { color: string; position: number }[] };
      const after = afterValue as { type: 'linear' | 'radial'; angle?: number; stops: { color: string; position: number }[] };

      // Interpolate angle if both gradients are linear
      const angle = before.type === 'linear' && after.type === 'linear' && before.angle !== undefined && after.angle !== undefined
        ? interpolateNumber(before.angle, after.angle, progress, easing)
        : before.angle;

      // Interpolate stop positions and blend colors
      const stops = before.stops.map((beforeStop, index) => {
        const afterStop = after.stops[index] ?? after.stops[after.stops.length - 1];
        return {
          color: blendColors(beforeStop.color, afterStop.color, progress),
          position: interpolateNumber(beforeStop.position, afterStop.position, progress, easing)
        };
      });

      return {
        type: before.type,
        angle,
        stops
      };
    }

    return beforeValue;
  };

  const blendColors = (color1: string, color2: string, progress: number): string => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const interpolateNumber = (start: number, end: number, progress: number, easing: string): number => {
    let t = progress;
    
    switch (easing) {
      case 'ease-in':
        t = t * t;
        break;
      case 'ease-out':
        t = t * (2 - t);
        break;
      case 'ease-in-out':
        t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        break;
      case 'bounce':
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          t = n1 * t * t;
        } else if (t < 2 / d1) {
          t = n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          t = n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          t = n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
        break;
    }

    return start + (end - start) * t;
  };

  const handleAddKeyframe = (property: AnimatableProperty) => {
    const currentValue = getPropertyValue(property, currentTime);
    onKeyframeAdd(
      property.name,
      currentTime,
      currentValue
    );
  };

  const handleKeyframeUpdate = (
    property: string,
    keyframeId: string,
    value: PropertyValue,
    easing?: EasingType
  ) => {
    onKeyframeUpdate(property, keyframeId, {
      properties: {
        [property]: {
          value,
          easing: easing as EasingType | undefined
        }
      }
    });
  };

  const handleUpdateKeyframe = (
    keyframe: Keyframe,
    property: AnimatableProperty,
    value: PropertyValue,
    easing: string
  ) => {
    handleKeyframeUpdate(
      property.name,
      keyframe.id,
      property.type === 'number' ? parseFloat(value.toString()) : value,
      easing as EasingType
    );
  };

  const handlePresetSelect = (preset: ImportedAnimationPreset & { keyframes?: Array<{
    time: number;
    properties: Record<string, { value: PropertyValue; easing?: EasingType }>;
  }> }) => {
    if (!selectedProperty || !preset.keyframes) return;

    // Add all keyframes from the preset
    preset.keyframes.forEach((kf) => {
      Object.keys(kf.properties).forEach(propertyName => {
        const { value, easing } = kf.properties[propertyName];
        handleKeyframeUpdate(propertyName, `kf-${Date.now()}`, value as PropertyValue, easing);
      });
    });
    setShowPresets(false);
  };

  const handleCopyKeyframes = () => {
    if (!selectedProperty) return;
    setCopiedKeyframes({
      property: selectedProperty,
      keyframes: [...(clip.keyframes[selectedProperty] || [])]
    });
  };

  const handlePasteKeyframes = () => {
    if (!selectedProperty || !copiedKeyframes) return;

    // Remove existing keyframes
    const existingKeyframes = clip.keyframes[selectedProperty] || [];
    existingKeyframes.forEach(kf => {
      onKeyframeDelete(selectedProperty, kf.id);
    });

    // Add copied keyframes
    copiedKeyframes.keyframes.forEach(kf => {
      onKeyframeAdd(
        selectedProperty,
        kf.time,
        kf.properties[copiedKeyframes.property].value,
        kf.properties[copiedKeyframes.property].easing
      );
    });
  };

  // Draw interpolation preview
  useEffect(() => {
    if (!canvasRef.current || !selectedProperty) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const property = clip.animatableProperties.find(p => p.name === selectedProperty);
    if (!property) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const steps = canvas.width;
    for (let i = 0; i < steps; i++) {
      const time = (i / steps) * clip.duration;
      const value = getPropertyValue(property, time);
      const x = i;
      const y = typeof value === 'number'
        ? canvas.height - (value * canvas.height)
        : canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }, [selectedProperty, clip, currentTime]);

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-white">Keyframe Editor</h3>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
          >
            Presets
          </button>
          {selectedProperty && (
            <>
              <button
                onClick={handleCopyKeyframes}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
              >
                Copy
              </button>
              {copiedKeyframes && (
                <button
                  onClick={handlePasteKeyframes}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                >
                  Paste
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {clip.animatableProperties.map(property => (
            <button
              key={property.name}
              onClick={() => setSelectedProperty(property.name)}
              className={`px-3 py-1 rounded text-sm ${
                selectedProperty === property.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {property.name}
            </button>
          ))}
        </div>
      </div>

      {showPresets && (
        <div className="mb-4">
          <AnimationPresets
            onPresetSelect={handlePresetSelect}
            selectedCategory={selectedProperty || undefined}
          />
        </div>
      )}

      {selectedProperty && (
        <>
          <div className="relative h-20 bg-gray-900 rounded-lg overflow-hidden mb-4">
            {/* Property timeline */}
            <div
              className="absolute inset-0"
              style={{
                width: `${clip.duration * pixelsPerSecond}px`,
              }}
            >
              {(clip.keyframes[selectedProperty] || []).map(keyframe => (
                <div
                  key={keyframe.id}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    left: `${keyframe.time * pixelsPerSecond}px`,
                  }}
                  onClick={() => {
                    const property = clip.animatableProperties.find(p => p.name === selectedProperty);
                    if (!property) return;

                    const value = window.prompt('Enter new value:', 
                      keyframe.properties[selectedProperty].value.toString()
                    );
                    if (value === null) return;

                    const easing = window.prompt(
                      'Enter easing (linear, ease-in, ease-out, ease-in-out, bounce):',
                      keyframe.properties[selectedProperty].easing || 'linear'
                    );

                    handleUpdateKeyframe(
                      keyframe,
                      property,
                      value,
                      easing || 'linear'
                    );
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (window.confirm('Delete this keyframe?')) {
                      onKeyframeDelete(selectedProperty, keyframe.id);
                    }
                  }}
                />
              ))}

              {/* Add keyframe button */}
              <button
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full hover:bg-blue-400 flex items-center justify-center text-white text-xs"
                style={{
                  left: `${currentTime * pixelsPerSecond}px`,
                }}
                onClick={() => {
                  const property = clip.animatableProperties.find(p => p.name === selectedProperty);
                  if (property) {
                    handleAddKeyframe(property);
                  }
                }}
              >
                +
              </button>

              {/* Interpolation preview */}
              <canvas
                ref={canvasRef}
                width={clip.duration * pixelsPerSecond}
                height={80}
                className="absolute inset-0 pointer-events-none"
              />
            </div>
          </div>

          {/* Property editor */}
          <div className="flex items-center space-x-4 mb-4">
            <PropertyEditor
              property={clip.animatableProperties.find(p => p.name === selectedProperty)!}
              value={getPropertyValue(
                clip.animatableProperties.find(p => p.name === selectedProperty)!,
                currentTime
              )}
              onChange={(value, easing) => {
                const property = clip.animatableProperties.find(p => p.name === selectedProperty)!;
                handleUpdateKeyframe(
                  { id: `kf-${Date.now()}`, time: currentTime, properties: {} },
                  property,
                  value,
                  easing || 'linear'
                );
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default KeyframeEditor;
