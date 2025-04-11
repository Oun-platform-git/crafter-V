import { FC, useRef, useEffect, useState } from 'react';
import { VideoClip } from '../Timeline/Timeline';

interface PreviewPlayerProps {
  clips: VideoClip[];
  currentTime: number;
  playing: boolean;
  onTimeUpdate: (time: number) => void;
  fps?: number;
  quality?: 'low' | 'medium' | 'high';
}

const PreviewPlayer: FC<PreviewPlayerProps> = ({
  clips,
  currentTime,
  playing,
  onTimeUpdate,
  fps = 30,
  quality = 'medium'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const frameInterval = 1000 / fps;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setContext(ctx);
    
    // Set canvas size based on quality
    const scale = quality === 'low' ? 0.5 : quality === 'medium' ? 1 : 1.5;
    canvas.width = 1920 * scale;
    canvas.height = 1080 * scale;
  }, [quality]);

  useEffect(() => {
    if (!context || !playing) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        // Update time
        const newTime = currentTime + deltaTime / 1000;
        onTimeUpdate(newTime);
        
        // Clear canvas
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        // Render each clip
        clips.forEach(clip => {
          if (currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration) {
            renderClip(context, clip, currentTime - clip.startTime);
          }
        });

        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [context, playing, clips, frameInterval]);

  // Render single frame when not playing
  useEffect(() => {
    if (!context || playing) return;

    // Clear canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render each clip
    clips.forEach(clip => {
      if (currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration) {
        renderClip(context, clip, currentTime - clip.startTime);
      }
    });
  }, [context, currentTime, clips, playing]);

  const renderClip = (
    ctx: CanvasRenderingContext2D,
    clip: VideoClip,
    localTime: number
  ) => {
    // Apply clip properties and effects
    ctx.save();

    // Get current property values
    const opacity = getPropertyValue(clip, 'opacity', localTime) as number;
    const scale = getPropertyValue(clip, 'scale', localTime) as number;
    const rotation = getPropertyValue(clip, 'rotation', localTime) as number;
    const position = getPropertyValue(clip, 'position', localTime) as { x: number; y: number };
    const position3d = getPropertyValue(clip, 'position3d', localTime) as { x: number; y: number; z: number };

    // Apply transforms
    ctx.globalAlpha = opacity;
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Apply 3D transform if available
    if (position3d) {
      const perspective = 1000;
      const scale3d = perspective / (perspective - position3d.z);
      ctx.scale(scale3d, scale3d);
      ctx.translate(position3d.x, position3d.y);
    }

    // Draw clip content based on type
    switch (clip.type) {
      case 'video':
        // Handle video frame rendering
        break;
      case 'text':
        // Handle text rendering with effects
        renderText(ctx, clip, localTime);
        break;
      case 'effect':
        // Handle effect overlays
        renderEffect(ctx, clip, localTime);
        break;
    }

    ctx.restore();
  };

  const renderText = (
    ctx: CanvasRenderingContext2D,
    clip: VideoClip,
    localTime: number
  ) => {
    const text = clip.text || '';
    const fontSize = getPropertyValue(clip, 'fontSize', localTime) as number || 32;
    const color = getPropertyValue(clip, 'color', localTime) as string || '#000000';
    const gradient = getPropertyValue(clip, 'gradient', localTime) as {
      type: 'linear' | 'radial';
      angle?: number;
      stops: { color: string; position: number }[];
    };

    ctx.font = `${fontSize}px Arial`;
    
    if (gradient) {
      const grad = gradient.type === 'linear' 
        ? ctx.createLinearGradient(-100, 0, 100, 0)
        : ctx.createRadialGradient(0, 0, 0, 0, 0, 100);

      gradient.stops.forEach(stop => {
        grad.addColorStop(stop.position, stop.color);
      });

      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }

    ctx.fillText(text, 0, 0);
  };

  const renderEffect = (
    ctx: CanvasRenderingContext2D,
    clip: VideoClip,
    localTime: number
  ) => {
    // Apply visual effects (blur, glow, etc.)
    const filters = clip.effects.map(effect => {
      switch (effect.type) {
        case 'blur':
          return `blur(${effect.amount}px)`;
        case 'brightness':
          return `brightness(${effect.amount})`;
        case 'contrast':
          return `contrast(${effect.amount}%)`;
        default:
          return '';
      }
    }).join(' ');

    if (filters) {
      ctx.filter = filters;
    }
  };

  const getPropertyValue = (clip: VideoClip, propertyName: string, time: number) => {
    const property = clip.animatableProperties.find(p => p.name === propertyName);
    if (!property) return property?.default;

    const keyframes = clip.keyframes[propertyName];
    if (!keyframes?.length) return property.default;

    // Find surrounding keyframes
    const beforeKeyframe = [...keyframes]
      .reverse()
      .find(k => k.time <= time);
    const afterKeyframe = keyframes
      .find(k => k.time > time);

    if (!beforeKeyframe) return afterKeyframe?.properties[propertyName].value ?? property.default;
    if (!afterKeyframe) return beforeKeyframe.properties[propertyName].value;

    // Interpolate between keyframes
    const progress = (time - beforeKeyframe.time) / (afterKeyframe.time - beforeKeyframe.time);
    const beforeValue = beforeKeyframe.properties[propertyName].value;
    const afterValue = afterKeyframe.properties[propertyName].value;
    const easing = beforeKeyframe.properties[propertyName].easing || 'linear';

    return interpolateValue(beforeValue, afterValue, progress, easing);
  };

  const interpolateValue = (start: any, end: any, progress: number, easing: string) => {
    // Apply easing function
    const easedProgress = applyEasing(progress, easing);

    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * easedProgress;
    }

    if (typeof start === 'object' && typeof end === 'object') {
      const result: any = {};
      for (const key in start) {
        if (key in end) {
          result[key] = interpolateValue(start[key], end[key], easedProgress, easing);
        }
      }
      return result;
    }

    return start;
  };

  const applyEasing = (progress: number, easing: string): number => {
    switch (easing) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2);
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'bounce':
        const n1 = 7.5625;
        const d1 = 2.75;
        if (progress < 1 / d1) {
          return n1 * progress * progress;
        } else if (progress < 2 / d1) {
          return n1 * (progress -= 1.5 / d1) * progress + 0.75;
        } else if (progress < 2.5 / d1) {
          return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
        } else {
          return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
        }
      default:
        return progress;
    }
  };

  return (
    <div className="preview-player">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

export default PreviewPlayer;
