import { FC, ReactNode, useState, useEffect, useCallback } from 'react';
import { CategoryType, presets } from '../../../utils/animations';
import { SmartSuggestions } from './CategoryOverlays';
import VideoPreview from './VideoPreview';

interface Tool {
  id: string;
  icon: string;
  label: string;
  description: string;
}

const tools: Tool[] = [
  { id: 'trim', icon: '✂️', label: 'Trim / Auto-60s', description: 'Quick trim and auto-duration tools' },
  { id: 'beatSync', icon: '🎵', label: 'Beat Sync', description: 'Sync video cuts to music beats' },
  { id: 'text', icon: '🔤', label: 'Text Effects', description: 'Add animated text overlays' },
  { id: 'hookAnalyzer', icon: '📊', label: 'Hook Analyzer', description: 'Optimize your video hooks' },
  { id: 'filters', icon: '🌈', label: 'Filter Presets', description: 'Apply professional color grades' },
  { id: 'loopFade', icon: '🔁', label: 'Loop Fade', description: 'Create seamless video loops' },
  { id: 'collab', icon: '🤝', label: 'Collab Stitcher', description: 'Combine multiple creator clips' }
];

interface TimelineSegment {
  id: string;
  thumbnail: string;
  duration: number;
  markers: { type: 'beat' | 'hook' | 'replay'; time: number }[];
}

interface ShortsEditorProps {
  className?: string;
  children?: ReactNode;
  category: CategoryType;
  videoSrc?: string;
}

const ShortsEditor: FC<ShortsEditorProps> = ({ className = '', children, category, videoSrc }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const preset = presets[category];

  // Apply category-specific styles based on preset
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-font', preset.fonts[0]);
    
    // Clean up when unmounting
    return () => {
      root.style.removeProperty('--primary-font');
    };
  }, [preset]);

  // Update current time when video is playing
  const updateTime = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Example timeline segments using the TimelineSegment interface
  const segments: TimelineSegment[] = [
    {
      id: '1',
      thumbnail: 'path/to/thumb1.jpg',
      duration: 15,
      markers: [
        { type: 'beat', time: 3 },
        { type: 'hook', time: 0 },
      ]
    },
    {
      id: '2',
      thumbnail: 'path/to/thumb2.jpg',
      duration: 12,
      markers: [
        { type: 'beat', time: 6 },
        { type: 'replay', time: 8 },
      ]
    }
  ];

  return (
    <div className={`flex h-full bg-gray-900 text-white ${className}`}>
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center p-4">
        {/* Preview Controls */}
        <div className="flex space-x-3 mb-4">
          <button className={`p-2 rounded-lg ${isLooping ? 'bg-blue-500' : 'bg-gray-700'}`}
                  onClick={() => setIsLooping(!isLooping)}>
            🔁 Auto-loop
          </button>
          <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            ⚡ Instant Replay
          </button>
          <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            📸 Generate Thumbnail
          </button>
          <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            📱 Phone Preview
          </button>
        </div>

        {/* Vertical Canvas */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ width: '337.5px', height: '600px' }}>
          {/* Video Preview */}
          <VideoPreview
            src={videoSrc}
            isLooping={isLooping}
            onTimeUpdate={updateTime}
          />

          {/* Smart Suggestions */}
          <SmartSuggestions category={category} />

          {/* Category-specific overlays */}
          {children}

          {/* Current time indicator */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur rounded px-2 py-1 text-sm">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Toolbelt Sidebar */}
      <div className="w-20 bg-gray-800 flex flex-col items-center py-4 border-l border-gray-700">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`relative group w-12 h-12 mb-4 flex items-center justify-center rounded-xl cursor-pointer transition-all
              ${selectedTool === tool.id ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setSelectedTool(tool.id === selectedTool ? null : tool.id)}
          >
            <span className="text-xl">{tool.icon}</span>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {tool.label}
            </div>

            {/* Tool Drawer */}
            {selectedTool === tool.id && (
              <div className="absolute left-full ml-4 w-64 bg-gray-800 rounded-lg p-4 shadow-xl">
                <h3 className="text-lg font-medium mb-2">{tool.label}</h3>
                <p className="text-sm text-gray-400 mb-4">{tool.description}</p>
                {/* Tool-specific controls would go here */}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gray-800/95 backdrop-blur border-t border-gray-700">
        <div className="flex items-center h-full px-4">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="relative h-16 w-24 bg-gray-700 rounded-md mr-2 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500"
            >
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-blue-500/20">
                {/* Markers */}
                {segment.markers.map((marker, i) => (
                  <div
                    key={i}
                    className={`absolute bottom-0 w-1 h-full 
                      ${marker.type === 'beat' ? 'bg-yellow-500' : 
                        marker.type === 'hook' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ left: `${(marker.time / segment.duration) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortsEditor;
