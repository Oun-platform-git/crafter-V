import { FC } from 'react';
import { CategoryType, getSuggestions } from '../../../utils/animations';

interface TimestampOverlayProps {
  timestamp: string;
  location?: string;
  mood?: string;
}

export const TimestampOverlay: FC<TimestampOverlayProps> = ({ timestamp, location, mood }) => (
  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded-lg p-2 text-white text-sm">
    <div className="flex items-center space-x-2">
      <span>🕒 {timestamp}</span>
      {location && <span>📍 {location}</span>}
      {mood && <span>😊 {mood}</span>}
    </div>
  </div>
);

interface SplitScreenProps {
  beforeSrc: string;
  afterSrc: string;
}

export const SplitScreen: FC<SplitScreenProps> = ({ beforeSrc, afterSrc }) => (
  <div className="relative w-full h-full">
    <div className="absolute inset-0 overflow-hidden">
      <img src={beforeSrc} alt="Before" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}>
      <img src={afterSrc} alt="After" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-y-0 left-1/2 w-1 bg-white" />
  </div>
);

interface StepOverlayProps {
  step: number;
  total: number;
  title: string;
}

export const StepOverlay: FC<StepOverlayProps> = ({ step, total, title }) => (
  <div className="absolute top-4 left-4 right-4 flex items-center space-x-4">
    <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
      {step}
    </div>
    <div className="flex-1">
      <div className="h-2 bg-gray-700 rounded-full">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <p className="text-white mt-2">{title}</p>
    </div>
  </div>
);

interface SceneJumpPanelProps {
  scenes: Array<{ id: string; thumbnail: string; title: string }>;
  currentScene: string;
  onSceneSelect: (id: string) => void;
}

export const SceneJumpPanel: FC<SceneJumpPanelProps> = ({ scenes, currentScene, onSceneSelect }) => (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur rounded-lg p-2">
    {scenes.map(scene => (
      <div
        key={scene.id}
        className={`w-16 h-16 mb-2 rounded-lg cursor-pointer overflow-hidden border-2 transition-all
          ${currentScene === scene.id ? 'border-blue-500 scale-110' : 'border-transparent hover:border-white/50'}`}
        onClick={() => onSceneSelect(scene.id)}
      >
        <img src={scene.thumbnail} alt={scene.title} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
);

interface PetOverlaysProps {
  thought?: string;
  stickers: Array<{ id: string; src: string }>;
  onStickerSelect: (id: string) => void;
}

export const PetOverlays: FC<PetOverlaysProps> = ({ thought, stickers, onStickerSelect }) => (
  <>
    {thought && (
      <div className="absolute top-4 left-4 bg-white rounded-lg p-3 text-black max-w-[200px]">
        <div className="relative">
          {thought}
          <div className="absolute -bottom-6 left-4 w-4 h-4 bg-white transform rotate-45" />
        </div>
      </div>
    )}
    <div className="absolute right-4 top-4 flex flex-col space-y-2">
      {stickers.map(sticker => (
        <button
          key={sticker.id}
          onClick={() => onStickerSelect(sticker.id)}
          className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-all"
        >
          <img src={sticker.src} alt="Pet sticker" className="w-full h-full object-contain" />
        </button>
      ))}
    </div>
  </>
);

interface ReactionLayoutProps {
  mainVideo: string;
  reactionVideo: string;
  layout: 'pip' | 'sideBySide';
}

export const ReactionLayout: FC<ReactionLayoutProps> = ({ mainVideo, reactionVideo, layout }) => (
  <div className="relative w-full h-full">
    <div className="absolute inset-0">
      <video src={mainVideo} className="w-full h-full object-cover" />
    </div>
    {layout === 'pip' ? (
      <div className="absolute bottom-4 right-4 w-1/3 aspect-video rounded-lg overflow-hidden border-2 border-white">
        <video src={reactionVideo} className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className="absolute inset-y-0 right-0 w-1/2">
        <video src={reactionVideo} className="w-full h-full object-cover" />
      </div>
    )}
  </div>
);

interface SmartSuggestionsProps {
  category: CategoryType;
}

export const SmartSuggestions: FC<SmartSuggestionsProps> = ({ category }) => {
  const suggestions = getSuggestions(category);
  
  return (
    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur rounded-lg p-4 text-white">
      <h3 className="font-medium mb-2">Smart Suggestions</h3>
      <div className="space-y-1 text-sm">
        <p>🎨 Font: {suggestions.font}</p>
        <p>✨ Effects: {suggestions.animationBundle.join(', ')}</p>
        <p>⏱️ Duration: {suggestions.duration}</p>
        <p>🎵 Music: {suggestions.music}</p>
      </div>
    </div>
  );
};
