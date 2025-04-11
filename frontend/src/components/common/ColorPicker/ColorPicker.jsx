import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#88FF00',
  '#0088FF', '#FF0088', '#8800FF', '#00FF88', '#888888',
];

export default function ColorPicker({
  value = '#000000',
  onChange,
  label,
  presets = PRESETS,
  showAlpha = false,
  disabled = false,
  error,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(1);
  
  const pickerRef = useRef(null);
  const saturationRef = useRef(null);
  const hueRef = useRef(null);
  const alphaRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Convert hex to HSL when value changes
    const hexToHSL = (hex) => {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;

      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      setHue(h * 360);
      setSaturation(s * 100);
      setLightness(l * 100);
    };

    hexToHSL(value);
  }, [value]);

  const handleSaturationChange = (e) => {
    if (!saturationRef.current) return;

    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setSaturation(x * 100);
    setLightness(100 - y * 100);
    updateColor(hue, x * 100, 100 - y * 100, alpha);
  };

  const handleHueChange = (e) => {
    if (!hueRef.current) return;

    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 360;

    setHue(newHue);
    updateColor(newHue, saturation, lightness, alpha);
  };

  const handleAlphaChange = (e) => {
    if (!alphaRef.current) return;

    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    setAlpha(x);
    updateColor(hue, saturation, lightness, x);
  };

  const updateColor = (h, s, l, a) => {
    const hslToHex = (h, s, l) => {
      s /= 100;
      l /= 100;

      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = l - c/2;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const hex = hslToHex(h, s, l);
    setCurrentColor(hex);
    onChange(hex);
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && (
        <label
          className={`
            block
            text-sm
            font-medium
            mb-1
            ${isDark ? 'text-gray-200' : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      )}

      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full
          px-3
          py-2
          rounded-lg
          border
          ${error
            ? isDark
              ? 'border-red-500'
              : 'border-red-500'
            : isDark
            ? 'border-gray-700'
            : 'border-gray-300'
          }
          ${isDark ? 'bg-gray-800' : 'bg-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          flex
          items-center
          gap-2
        `}
      >
        <div
          className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: currentColor }}
        />
        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
          {currentColor}
        </span>
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {isOpen && (
        <div
          className={`
            absolute
            z-50
            mt-2
            p-4
            rounded-lg
            shadow-lg
            ${isDark ? 'bg-gray-900' : 'bg-white'}
            ${isDark ? 'border border-gray-800' : 'border border-gray-200'}
            animate-scaleIn
            origin-top-left
          `}
        >
          {/* Saturation/Lightness picker */}
          <div
            ref={saturationRef}
            className="w-64 h-40 relative rounded-lg cursor-crosshair mb-4"
            style={{
              background: `linear-gradient(to right, #fff 0%, hsl(${hue}, 100%, 50%) 100%)`
            }}
            onMouseDown={(e) => {
              handleSaturationChange(e);
              const handleMouseMove = (e) => handleSaturationChange(e);
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, #000 100%)'
              }}
            />
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${saturation}%`,
                top: `${100 - lightness}%`,
                backgroundColor: currentColor
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            ref={hueRef}
            className="w-64 h-3 relative rounded-lg cursor-pointer mb-4"
            style={{
              background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
            }}
            onMouseDown={(e) => {
              handleHueChange(e);
              const handleMouseMove = (e) => handleHueChange(e);
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
              style={{
                left: `${(hue / 360) * 100}%`,
                top: '50%',
                backgroundColor: `hsl(${hue}, 100%, 50%)`
              }}
            />
          </div>

          {/* Alpha slider */}
          {showAlpha && (
            <div
              ref={alphaRef}
              className="w-64 h-3 relative rounded-lg cursor-pointer mb-4"
              style={{
                background: `linear-gradient(to right, transparent 0%, ${currentColor} 100%)`
              }}
              onMouseDown={(e) => {
                handleAlphaChange(e);
                const handleMouseMove = (e) => handleAlphaChange(e);
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
                style={{
                  left: `${alpha * 100}%`,
                  top: '50%',
                  backgroundColor: currentColor
                }}
              />
            </div>
          )}

          {/* Presets */}
          <div className="grid grid-cols-5 gap-2">
            {presets.map((color, index) => (
              <button
                key={index}
                className={`
                  w-8
                  h-8
                  rounded-lg
                  border-2
                  ${isDark ? 'border-gray-700' : 'border-gray-200'}
                  ${color === currentColor ? 'ring-2 ring-blue-500' : ''}
                  transition-all
                  duration-200
                `}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  onChange(color);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
