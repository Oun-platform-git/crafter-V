import { FC, useState } from 'react';
import { Link } from 'react-router-dom';

interface ReactionsState {
  isRecording: boolean;
  mainVideo: {
    url: string | null;
    volume: number;
  };
  reactionVideo: {
    url: string | null;
    volume: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: 'small' | 'medium' | 'large';
  };
  layout: {
    pip: boolean;
    splitScreen: boolean;
  };
}

const Reactions: FC = () => {
  const [state, setState] = useState<ReactionsState>({
    isRecording: false,
    mainVideo: {
      url: null,
      volume: 100,
    },
    reactionVideo: {
      url: null,
      volume: 100,
      position: 'top-right',
      size: 'medium',
    },
    layout: {
      pip: true,
      splitScreen: false,
    },
  });

  const pipPositionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const pipSizeClasses = {
    small: 'w-1/4',
    medium: 'w-1/3',
    large: 'w-1/2',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/shorts"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reaction Creator</h1>
                <p className="text-sm text-gray-500">Create engaging reaction videos</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700"
              disabled={!state.mainVideo.url || !state.reactionVideo.url}
            >
              Export Video
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Video Preview */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Preview Area */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="aspect-[9/16] bg-gray-100 rounded-lg relative">
                {/* Main Video */}
                {state.mainVideo.url ? (
                  <video className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => {/* Import main video */}}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Import Main Video</p>
                    </button>
                  </div>
                )}

                {/* Reaction Video (PiP) */}
                {state.layout.pip && state.reactionVideo.url && (
                  <div className={`
                    absolute ${pipPositionClasses[state.reactionVideo.position]}
                    ${pipSizeClasses[state.reactionVideo.size]}
                    aspect-video bg-gray-200 rounded-lg border-4 border-white shadow-lg
                  `}>
                    <video className="w-full h-full object-cover rounded-lg" />
                  </div>
                )}

                {/* Recording Indicator */}
                {state.isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 text-white px-4 py-2 rounded-full">
                    <span className="animate-pulse text-red-500">●</span>
                    <span>Recording</span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setState(prev => ({ ...prev, isRecording: !prev.isRecording }))}
                  className={`
                    px-6 py-3 rounded-lg font-medium flex items-center space-x-2
                    ${state.isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-fuchsia-500 text-white hover:bg-fuchsia-600'
                    }
                  `}
                >
                  {state.isRecording ? (
                    <>
                      <span className="animate-pulse">●</span>
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <span>Start Recording</span>
                  )}
                </button>

                {/* Layout Toggle */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      layout: { pip: true, splitScreen: false }
                    }))}
                    className={`
                      p-3 rounded-lg border-2
                      ${state.layout.pip
                        ? 'border-fuchsia-500 bg-fuchsia-50'
                        : 'border-gray-200 hover:border-fuchsia-200'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">PiP Mode</span>
                  </button>
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      layout: { pip: false, splitScreen: true }
                    }))}
                    className={`
                      p-3 rounded-lg border-2
                      ${state.layout.splitScreen
                        ? 'border-fuchsia-500 bg-fuchsia-50'
                        : 'border-gray-200 hover:border-fuchsia-200'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">Split Screen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* PiP Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Reaction Settings</h2>
              
              {/* Position Controls */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(pipPositionClasses).map((position) => (
                    <button
                      key={position}
                      onClick={() => setState(prev => ({
                        ...prev,
                        reactionVideo: { ...prev.reactionVideo, position: position as any }
                      }))}
                      className={`
                        p-2 rounded-lg border-2 text-center
                        ${state.reactionVideo.position === position
                          ? 'border-fuchsia-500 bg-fuchsia-50'
                          : 'border-gray-200 hover:border-fuchsia-200'
                        }
                      `}
                    >
                      {position.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Controls */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(pipSizeClasses).map((size) => (
                    <button
                      key={size}
                      onClick={() => setState(prev => ({
                        ...prev,
                        reactionVideo: { ...prev.reactionVideo, size: size as any }
                      }))}
                      className={`
                        p-2 rounded-lg border-2 text-center
                        ${state.reactionVideo.size === size
                          ? 'border-fuchsia-500 bg-fuchsia-50'
                          : 'border-gray-200 hover:border-fuchsia-200'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Mixer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Mix
                </label>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Main Video</span>
                      <span>{state.mainVideo.volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.mainVideo.volume}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        mainVideo: { ...prev.mainVideo, volume: parseInt(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Reaction Audio</span>
                      <span>{state.reactionVideo.volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.reactionVideo.volume}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        reactionVideo: { ...prev.reactionVideo, volume: parseInt(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reactions;
