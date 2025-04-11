import { FC, useState } from 'react';
import { Link } from 'react-router-dom';

interface TransformationState {
  beforeVideo: string | null;
  afterVideo: string | null;
  isRecording: boolean;
  currentPhase: 'before' | 'after';
  duration: number;
  transformationType: 'fitness' | 'makeover' | 'renovation' | 'custom';
}

const Transformations: FC = () => {
  const [state, setState] = useState<TransformationState>({
    beforeVideo: null,
    afterVideo: null,
    isRecording: false,
    currentPhase: 'before',
    duration: 30,
    transformationType: 'fitness',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header with back button */}
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
                <h1 className="text-2xl font-bold text-gray-900">Transformation Creator</h1>
                <p className="text-sm text-gray-500">Create stunning before & after videos</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Export Video
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transformation Type */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Transformation Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'fitness', icon: '💪', label: 'Fitness' },
                  { id: 'makeover', icon: '✨', label: 'Makeover' },
                  { id: 'renovation', icon: '🏠', label: 'Renovation' },
                  { id: 'custom', icon: '🎨', label: 'Custom' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setState(prev => ({ ...prev, transformationType: type.id as any }))}
                    className={`
                      p-4 rounded-lg border-2 text-center
                      ${state.transformationType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                      }
                    `}
                  >
                    <span className="text-2xl block mb-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Control */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Duration</h3>
              <input
                type="range"
                min="15"
                max="60"
                step="15"
                value={state.duration}
                onChange={(e) => setState(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>15s</span>
                <span>30s</span>
                <span>45s</span>
                <span>60s</span>
              </div>
            </div>
          </div>

          {/* Center Panel - Video Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Before Video */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Before</h3>
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg relative">
                    {state.beforeVideo ? (
                      <video className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <button
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            currentPhase: 'before',
                            isRecording: true
                          }));
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="p-4 rounded-full bg-purple-100 text-purple-600">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* After Video */}
                <div>
                  <h3 className="text-lg font-medium mb-4">After</h3>
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg relative">
                    {state.afterVideo ? (
                      <video className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <button
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            currentPhase: 'after',
                            isRecording: true
                          }));
                        }}
                        disabled={!state.beforeVideo}
                        className={`
                          absolute inset-0 flex items-center justify-center
                          ${!state.beforeVideo ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="p-4 rounded-full bg-purple-100 text-purple-600">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              {state.isRecording && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setState(prev => ({ ...prev, isRecording: false }))}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                  >
                    <span className="animate-pulse">●</span>
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transformations;
