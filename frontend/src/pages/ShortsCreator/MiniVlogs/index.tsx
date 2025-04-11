import React from 'react';
import VideoRecorder from '../../../components/shared/VideoRecorder';
import VideoEditor from '../../../components/shared/VideoEditor';
import Timeline from '../../../components/shared/Timeline/Timeline';
import LayerManager from '../../../components/shared/LayerManager/LayerManager';
import TransitionPicker from '../../../components/shared/TransitionPicker';
import { TimestampOverlay } from '../../../components/shared/TimestampOverlay';
import { videoEffectsService } from '../../../services/videoEffects';

interface VideoClip {
  id: string;
  url: string;
  duration: number;
  mood: string;
  thumbnail?: string;
  startTime: number;
  effects: string[];
  content?: any;
}

interface VideoLayer {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  visible: boolean;
  locked: boolean;
  clips: Array<{
    id: string;
    startTime: number;
    duration: number;
    content: VideoClip;
  }>;
}

interface MiniVlogsState {
  isRecording: boolean;
  clips: VideoClip[];
  currentMood: 'happy' | 'excited' | 'chill' | 'serious';
  maxDuration: number;
  location?: string;
  processing: boolean;
  error?: string;
  currentTime: number;
  selectedClipId?: string;
  selectedLayerId?: string;
  layers: VideoLayer[];
  zoom: number;
  segments: VideoSegment[];
  isEditing: boolean;
}

interface VideoSegment {
  blob: Blob;
  startTime: number;
  duration: number;
}

const availableTransitions = [
  'fade',
  'wipe',
  'slide',
  'zoom',
  'dissolve',
  'glitch'
];

const MoodSelector: React.FC<{ currentMood: string; onMoodSelect: (mood: string) => void }> = ({ currentMood, onMoodSelect }) => (
  <div className="absolute top-20 left-4 bg-gray-800/80 backdrop-blur rounded-lg p-3">
    <h3 className="text-sm font-medium text-white mb-2">Mood</h3>
    <div className="flex space-x-2">
      {[
        { id: 'happy', icon: '😊' },
        { id: 'excited', icon: '🎉' },
        { id: 'chill', icon: '😎' },
        { id: 'serious', icon: '🤔' }
      ].map(mood => (
        <button
          key={mood.id}
          onClick={() => onMoodSelect(mood.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all
            ${currentMood === mood.id ? 'bg-blue-500 scale-110' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {mood.icon}
        </button>
      ))}
    </div>
  </div>
);

const QuickEffectsPanel: React.FC<{ onEffectSelect: (effect: string) => Promise<void> }> = ({ onEffectSelect }) => (
  <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur rounded-lg p-3">
    <h3 className="text-sm font-medium text-white mb-2">Quick Effects</h3>
    <div className="grid grid-cols-2 gap-2">
      {[
        { id: 'zoom', icon: '🔍', label: 'Zoom' },
        { id: 'blur', icon: '🌫️', label: 'Blur' },
        { id: 'flash', icon: '⚡', label: 'Flash' },
        { id: 'shake', icon: '📳', label: 'Shake' }
      ].map(effect => (
        <button
          key={effect.id}
          onClick={() => onEffectSelect(effect.id)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center space-x-2"
        >
          <span>{effect.icon}</span>
          <span>{effect.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const MiniVlogs: React.FC = () => {
  const [state, setState] = React.useState<MiniVlogsState>({
    isRecording: false,
    clips: [],
    currentMood: 'happy',
    maxDuration: 60,
    location: 'Home Office',
    processing: false,
    currentTime: 0,
    zoom: 1,
    layers: [
      {
        id: 'main',
        name: 'Main Video',
        type: 'video',
        visible: true,
        locked: false,
        clips: []
      },
      {
        id: 'overlay',
        name: 'Overlays',
        type: 'effect',
        visible: true,
        locked: false,
        clips: []
      },
      {
        id: 'audio',
        name: 'Audio',
        type: 'audio',
        visible: true,
        locked: false,
        clips: []
      }
    ],
    segments: [],
    isEditing: false
  });

  const handleRecordingComplete = (recordedSegments: VideoSegment[]) => {
    setState(prev => ({ ...prev, segments: recordedSegments, isEditing: true }));
  };

  const handleSaveEdit = async (editedSegments: VideoSegment[]) => {
    setState(prev => ({ ...prev, segments: editedSegments }));
    
    // Combine all segments into a single video
    const formData = new FormData();
    editedSegments.forEach((segment, index) => {
      formData.append(`segment${index}`, segment.blob);
      formData.append(`transition${index}`, 'fade'); // Default transition
    });

    try {
      const response = await fetch('/api/video/combine-segments', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const { url } = await response.json();
        // Handle successful video creation
        console.log('Combined video URL:', url);
      }
    } catch (error) {
      console.error('Error combining video segments:', error);
    }
  };

  const handleApplyEffect = async (effect: string) => {
    if (!state.selectedClipId) return;
    
    setState(prev => ({ ...prev, processing: true }));
    try {
      const processedUrl = await videoEffectsService.applyEffect(state.selectedClipId, effect);
      
      setState(prev => ({
        ...prev,
        clips: prev.clips.map(clip => 
          clip.id === state.selectedClipId 
            ? { ...clip, url: processedUrl, effects: [...clip.effects, effect] }
            : clip
        ),
        layers: prev.layers.map(layer => ({
          ...layer,
          clips: layer.clips.map(clip =>
            clip.id === state.selectedClipId
              ? { ...clip, content: { ...clip.content, url: processedUrl, effects: [...clip.content.effects, effect] } }
              : clip
          )
        })),
        processing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        processing: false,
        error: 'Failed to apply effect: ' + (error as Error).message
      }));
    }
  };

  const handleClipMove = (dragIndex: number, hoverIndex: number) => {
    setState(prev => {
      const newClips = [...prev.clips];
      const draggedClip = newClips[dragIndex];
      newClips.splice(dragIndex, 1);
      newClips.splice(hoverIndex, 0, draggedClip);

      // Recalculate start times
      let currentTime = 0;
      newClips.forEach(clip => {
        clip.startTime = currentTime;
        currentTime += clip.duration;
      });

      return {
        ...prev,
        clips: newClips,
        layers: prev.layers.map(layer =>
          layer.id === 'main' ? { ...layer, clips: newClips.map(clip => ({ id: clip.id, startTime: clip.startTime, duration: clip.duration, content: clip })) } : layer
        )
      };
    });
  };

  const handleLayerMove = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newLayers = [...prev.layers];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      return { ...prev, layers: newLayers };
    });
  };

  return (
    <div className="h-screen bg-gray-900 text-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Mini Vlogs</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {state.clips.length} clips • {state.clips.reduce((acc, clip) => acc + clip.duration, 0)}s
              </span>
              <button 
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium"
                disabled={state.processing || state.clips.length === 0}
              >
                {state.processing ? 'Processing...' : 'Export Video'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Editor */}
        <div className="flex-1 flex">
          {/* Left sidebar - Layers */}
          <div className="w-64 border-r border-gray-700 p-4">
            <LayerManager
              layers={state.layers}
              selectedLayerId={state.selectedLayerId}
              currentTime={state.currentTime}
              onLayerVisibilityChange={(layerId, visible) => {
                setState(prev => ({
                  ...prev,
                  layers: prev.layers.map(layer =>
                    layer.id === layerId ? { ...layer, visible } : layer
                  )
                }));
              }}
              onLayerLockChange={(layerId, locked) => {
                setState(prev => ({
                  ...prev,
                  layers: prev.layers.map(layer =>
                    layer.id === layerId ? { ...layer, locked } : layer
                  )
                }));
              }}
              onLayerMove={handleLayerMove}
              onLayerSelect={(layerId) => setState(prev => ({ ...prev, selectedLayerId: layerId }))}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Video preview */}
            <div className="relative aspect-[9/16] bg-black">
              {!state.isEditing ? (
                <VideoRecorder
                  onRecordingComplete={handleRecordingComplete}
                  maxDuration={state.maxDuration}
                  countdownDuration={3}
                />
              ) : (
                <VideoEditor
                  segments={state.segments}
                  onSave={handleSaveEdit}
                  availableTransitions={availableTransitions}
                />
              )}
              <TimestampOverlay 
                currentTime={state.currentTime}
                duration={state.clips.reduce((acc, clip) => acc + clip.duration, 0)}
                onTimeUpdate={(time) => setState(prev => ({ ...prev, currentTime: time }))}
                disabled={state.processing}
              />
              <MoodSelector 
                currentMood={state.currentMood} 
                onMoodSelect={(mood) => setState(prev => ({ ...prev, currentMood: mood as any }))} 
              />
              <QuickEffectsPanel onEffectSelect={handleApplyEffect} />
            </div>

            {/* Timeline */}
            <div className="flex-1 p-4">
              <Timeline
                clips={state.clips}
                currentTime={state.currentTime}
                duration={state.clips.reduce((acc, clip) => acc + clip.duration, 0)}
                onClipMove={handleClipMove}
                onClipTrim={(clipId, startTime, endTime) => {
                  setState(prev => ({
                    ...prev,
                    clips: prev.clips.map(clip =>
                      clip.id === clipId
                        ? { ...clip, startTime, duration: endTime - startTime }
                        : clip
                    )
                  }));
                }}
                onTimeUpdate={(time) => setState(prev => ({ ...prev, currentTime: time }))}
                onClipSelect={(clipId) => setState(prev => ({ ...prev, selectedClipId: clipId }))}
                selectedClipId={state.selectedClipId}
                zoom={state.zoom}
              />
            </div>
          </div>

          {/* Right sidebar - Effects & Transitions */}
          <div className="w-64 border-l border-gray-700 p-4">
            <TransitionPicker
              onSelect={async (selectedTransition) => {
                if (!state.selectedClipId) return;
                setState(prev => ({ ...prev, processing: true }));
                try {
                  const processedUrl = await videoEffectsService.applyTransition(
                    state.selectedClipId,
                    selectedTransition.id,
                    selectedTransition.duration
                  );
                  setState(prev => ({
                    ...prev,
                    clips: prev.clips.map(clip =>
                      clip.id === state.selectedClipId
                        ? { ...clip, url: processedUrl }
                        : clip
                    ),
                    processing: false
                  }));
                } catch (error) {
                  setState(prev => ({
                    ...prev,
                    processing: false,
                    error: 'Failed to apply transition: ' + (error as Error).message
                  }));
                }
              }}
              className="mb-4"
            />
          </div>
        </div>

        {state.error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/80 text-white p-4 rounded-lg">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniVlogs;
