import React, { FC, useRef, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TimelineTrack from './TimelineTrack';
import TimelineClip from './TimelineClip';
import TimelineCursor from './TimelineCursor';
import KeyframeEditor from './KeyframeEditor';
import TransitionEditor from './TransitionEditor';

export interface Keyframe {
  id: string;
  time: number;
  properties: {
    [key: string]: {
      value: number | string | { x: number; y: number } | { x: number; y: number; z: number } | {
        type: 'linear' | 'radial';
        angle?: number;
        stops: { color: string; position: number }[];
      };
      easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
    };
  };
}

export interface AnimatableProperty {
  name: string;
  type: 'number' | 'color' | 'position' | 'position3d' | 'scale' | 'rotation' | 'gradient' | 'bezier';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  default?: number | string | { x: number; y: number } | { x: number; y: number; z: number } | {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { color: string; position: number }[];
  };
}

interface AudioEffect {
  id: string;
  type: string;
  params: {
    [key: string]: number | boolean | string;
  };
  enabled: boolean;
}

export interface VideoClip {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  url: string;
  startTime: number;
  duration: number;
  thumbnail?: string;
  effects: any[];
  keyframes: {
    [propertyName: string]: Keyframe[];
  };
  animatableProperties: AnimatableProperty[];
  volume: number;
  pan: number;
  audioEffects: AudioEffect[];
  transitions?: Transition[];
}

export interface Transition {
  id: string;
  type: 'fade' | 'wipe' | 'slide' | 'zoom' | 'dissolve' | 'blur' | 'morph';
  duration: number;
  easing: string;
  params: {
    direction?: 'left' | 'right' | 'top' | 'bottom';
    intensity?: number;
    pattern?: string;
    color?: string;
    blur?: number;
    morphPoints?: { x: number; y: number }[];
  };
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  clips: VideoClip[];
  locked?: boolean;
  visible?: boolean;
  height?: number;
}

interface TimelineProps {
  tracks: Track[];
  currentTime: number;
  duration: number;
  onClipMove: (clipId: string, sourceTrackId: string, targetTrackId: string, newStartTime: number) => void;
  onClipTrim: (clipId: string, startTime: number, endTime: number) => void;
  onTimeUpdate: (time: number) => void;
  onClipSelect: (clipId: string) => void;
  onTrackAdd: (type: Track['type']) => void;
  onTrackRemove: (trackId: string) => void;
  onTrackLock: (trackId: string, locked: boolean) => void;
  onTrackVisibility: (trackId: string, visible: boolean) => void;
  onKeyframeAdd: (clipId: string, propertyName: string, time: number, value: number | string) => void;
  onKeyframeUpdate: (clipId: string, propertyName: string, keyframeId: string, updates: Partial<Keyframe>) => void;
  onKeyframeDelete: (clipId: string, propertyName: string, keyframeId: string) => void;
  onTransitionUpdate: (clipId: string, transition: any) => void;
  onTransitionRemove: (clipId: string) => void;
  selectedClipId?: string;
  zoom?: number;
  transitions?: { [clipId: string]: any };
  onPreviewFrame?: (time: number) => void;
}

const Timeline: FC<TimelineProps> = ({
  tracks,
  currentTime,
  duration,
  onClipMove,
  onClipTrim,
  onTimeUpdate,
  onClipSelect,
  onTrackAdd,
  onTrackRemove,
  onTrackLock,
  onTrackVisibility,
  onKeyframeAdd,
  onKeyframeUpdate,
  onKeyframeDelete,
  onTransitionUpdate,
  onTransitionRemove,
  selectedClipId,
  zoom = 1,
  transitions = {},
  onPreviewFrame
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = 100 * zoom;
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<number>();

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    onTimeUpdate(Math.max(0, Math.min(newTime, duration)));
  };

  const selectedClip = selectedClipId 
    ? tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId)
    : undefined;

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        const newTime = Math.min(currentTime + deltaTime, duration);
        onTimeUpdate(newTime);
        
        if (onPreviewFrame) {
          onPreviewFrame(newTime);
        }
        
        if (newTime >= duration) {
          setIsPlaying(false);
          onTimeUpdate(0);
          return;
        }
        
        playbackRef.current = requestAnimationFrame(animate);
      };
      
      playbackRef.current = requestAnimationFrame(animate);
    } else {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    }
    
    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    };
  }, [isPlaying, duration, onTimeUpdate, onPreviewFrame]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        {/* Track controls */}
        <div className="mb-4 flex items-center space-x-2">
          <button
            onClick={() => onTrackAdd('video')}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
          >
            + Video Track
          </button>
          <button
            onClick={() => onTrackAdd('audio')}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
          >
            + Audio Track
          </button>
          <button
            onClick={() => onTrackAdd('text')}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
          >
            + Text Track
          </button>
          <button
            onClick={() => onTrackAdd('effect')}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
          >
            + Effect Track
          </button>
        </div>

        <div className="relative" style={{ height: `${tracks.length * 80 + 40}px` }}>
          {/* Time markers */}
          <div className="absolute top-0 left-0 right-0 h-6 flex">
            {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
              <div
                key={i}
                className="border-l border-gray-600 h-full flex items-center"
                style={{ left: `${(i * pixelsPerSecond)}px`, position: 'absolute' }}
              >
                <span className="text-xs text-gray-400 ml-1">{i}s</span>
              </div>
            ))}
          </div>

          {/* Track headers */}
          <div className="absolute top-6 left-0 w-48 bottom-0 bg-gray-800 border-r border-gray-700">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2 border-b border-gray-700"
                style={{ height: '80px' }}
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onTrackVisibility(track.id, !track.visible)}
                    className={`p-1 rounded ${track.visible ? 'text-white' : 'text-gray-500'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onTrackLock(track.id, !track.locked)}
                    className={`p-1 rounded ${track.locked ? 'text-yellow-500' : 'text-gray-500'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                  <span className="text-sm text-white">{track.name}</span>
                </div>
                <button
                  onClick={() => onTrackRemove(track.id)}
                  className="p-1 text-red-500 hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Timeline content */}
          <div
            ref={timelineRef}
            className="absolute top-6 left-48 right-0 bottom-0 overflow-x-auto"
            style={{ 
              width: `${duration * pixelsPerSecond}px`,
              minWidth: 'calc(100% - 12rem)'
            }}
            onClick={handleTimelineClick}
          >
            {tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                height={80}
                locked={track.locked}
                visible={track.visible}
              >
                {track.clips.map((clip) => (
                  <TimelineClip
                    key={clip.id}
                    index={track.clips.indexOf(clip)}
                    clip={clip}
                    isSelected={clip.id === selectedClipId}
                    pixelsPerSecond={pixelsPerSecond}
                    onMove={(targetIndex) => {
                      const targetClip = track.clips[targetIndex];
                      onClipMove(
                        clip.id,
                        track.id,
                        track.id,
                        targetClip ? targetClip.startTime : clip.startTime
                      );
                    }}
                    onTrim={onClipTrim}
                    onClick={() => onClipSelect(clip.id)}
                    disabled={track.locked}
                    transition={transitions[clip.id]}
                    onTransitionChange={(transition) => onTransitionUpdate(clip.id, transition)}
                    onTransitionRemove={() => onTransitionRemove(clip.id)}
                    currentTime={currentTime}
                  />
                ))}
              </TimelineTrack>
            ))}

            {/* Playhead cursor */}
            <TimelineCursor
              currentTime={currentTime}
              pixelsPerSecond={pixelsPerSecond}
            />
          </div>
        </div>

        {/* Timeline controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-lg ${
                isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <button
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
              onClick={() => onTimeUpdate(0)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            {selectedClip && !transitions[selectedClip.id] && (
              <button
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
                onClick={() => onTransitionUpdate(selectedClip.id, {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'fade',
                  duration: Math.min(1, selectedClip.duration),
                  properties: {}
                })}
              >
                Add Transition
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
              {Math.floor(duration / 60)}:
              {Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => onTimeUpdate(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        {/* Transition editor */}
        {selectedClip && transitions[selectedClip.id] && (
          <TransitionEditor
            transition={transitions[selectedClip.id]}
            duration={selectedClip.duration}
            onTransitionChange={(transition) => onTransitionUpdate(selectedClip.id, transition)}
            onTransitionRemove={() => onTransitionRemove(selectedClip.id)}
          />
        )}

        {/* Keyframe editor */}
        {selectedClip && (
          <KeyframeEditor
            clip={selectedClip}
            currentTime={currentTime}
            pixelsPerSecond={pixelsPerSecond}
            onKeyframeAdd={(propertyName, time, value) =>
              onKeyframeAdd(selectedClip.id, propertyName, time, value)
            }
            onKeyframeUpdate={(propertyName, keyframeId, updates) =>
              onKeyframeUpdate(selectedClip.id, propertyName, keyframeId, updates)
            }
            onKeyframeDelete={(propertyName, keyframeId) =>
              onKeyframeDelete(selectedClip.id, propertyName, keyframeId)
            }
          />
        )}
      </div>
    </DndProvider>
  );
};

export default Timeline;
