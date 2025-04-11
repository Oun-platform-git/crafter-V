import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import VideoRecorder from '../../../components/shared/VideoRecorder';
import VideoPreview from '../../../components/shared/VideoPreview';

interface Take {
  id: string;
  videoUrl: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

interface Scene {
  id: string;
  title: string;
  takes: Take[];
  selectedTakeId: string | null;
  script: string;
}

interface ComedySkitsState {
  isRecording: boolean;
  currentSceneIndex: number;
  scenes: Scene[];
  effects: {
    soundEffects: boolean;
    visualEffects: boolean;
    transitions: boolean;
  };
  autoSwitchTakes: boolean;
}

const ComedySkits: FC = () => {
  const [state, setState] = useState<ComedySkitsState>({
    isRecording: false,
    currentSceneIndex: 0,
    scenes: [],
    effects: {
      soundEffects: true,
      visualEffects: true,
      transitions: true,
    },
    autoSwitchTakes: true,
  });

  const addNewScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      title: `Scene ${state.scenes.length + 1}`,
      takes: [],
      selectedTakeId: null,
      script: '',
    };
    setState(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene]
    }));
  };

  const addTakeToScene = (sceneId: string) => {
    const newTake: Take = {
      id: Date.now().toString(),
      videoUrl: null,
      rating: 3,
      notes: '',
    };
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === sceneId
          ? { ...scene, takes: [...scene.takes, newTake] }
          : scene
      )
    }));
  };

  const updateTake = (sceneId: string, takeId: string, updates: Partial<Take>) => {
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === sceneId
          ? {
              ...scene,
              takes: scene.takes.map(take =>
                take.id === takeId ? { ...take, ...updates } : take
              )
            }
          : scene
      )
    }));
  };

  const currentScene = state.scenes[state.currentSceneIndex];
  const currentTake = currentScene?.takes.find(
    take => take.id === currentScene.selectedTakeId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Comedy Skit Creator</h1>
                <p className="text-sm text-gray-500">Create multi-scene comedy skits</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              disabled={state.scenes.length === 0}
            >
              Export Skit
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
              <VideoPreview
                videoUrl={currentTake?.videoUrl}
                emptyState={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={addNewScene}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Add First Scene</p>
                    </button>
                  </div>
                }
              />

              {/* Recording Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <VideoRecorder
                    isRecording={state.isRecording}
                    onToggleRecording={() => setState(prev => ({ ...prev, isRecording: !prev.isRecording }))}
                    buttonColor="amber"
                    buttonText="Record Take"
                  />

                  {/* Scene Navigation */}
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={state.currentSceneIndex === 0}
                      onClick={() => setState(prev => ({
                        ...prev,
                        currentSceneIndex: prev.currentSceneIndex - 1
                      }))}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      disabled={state.currentSceneIndex === state.scenes.length - 1}
                      onClick={() => setState(prev => ({
                        ...prev,
                        currentSceneIndex: prev.currentSceneIndex + 1
                      }))}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Effect Toggles */}
                <div className="flex items-center space-x-4">
                  {Object.entries(state.effects).map(([effect, enabled]) => (
                    <button
                      key={effect}
                      onClick={() => setState(prev => ({
                        ...prev,
                        effects: {
                          ...prev.effects,
                          [effect]: !enabled
                        }
                      }))}
                      className={`
                        p-2 rounded-lg border-2
                        ${enabled
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200'
                        }
                      `}
                    >
                      <span className="text-sm font-medium">
                        {effect.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Scenes & Takes */}
          <div className="lg:col-span-4 space-y-6">
            {/* Scenes List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Scenes</h2>
                <button
                  onClick={addNewScene}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {state.scenes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No scenes added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add scenes to create your skit</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${index === state.currentSceneIndex
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <input
                          type="text"
                          value={scene.title}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            scenes: prev.scenes.map(s =>
                              s.id === scene.id ? { ...s, title: e.target.value } : s
                            )
                          }))}
                          className="font-medium bg-transparent focus:outline-none"
                          placeholder="Scene title..."
                        />
                        <button
                          onClick={() => addTakeToScene(scene.id)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Takes */}
                      <div className="space-y-2">
                        {scene.takes.map(take => (
                          <div
                            key={take.id}
                            className={`
                              p-2 rounded border transition-all
                              ${take.id === scene.selectedTakeId
                                ? 'border-amber-500 bg-amber-50/50'
                                : 'border-gray-200'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  checked={take.id === scene.selectedTakeId}
                                  onChange={() => setState(prev => ({
                                    ...prev,
                                    scenes: prev.scenes.map(s =>
                                      s.id === scene.id ? { ...s, selectedTakeId: take.id } : s
                                    )
                                  }))}
                                  className="text-amber-500 focus:ring-amber-500"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Take {scene.takes.indexOf(take) + 1}</span>
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                          key={rating}
                                          onClick={() => updateTake(scene.id, take.id, { rating: rating as Take['rating'] })}
                                          className={`text-sm ${rating <= take.rating ? 'text-amber-400' : 'text-gray-300'}`}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={take.notes}
                                    onChange={(e) => updateTake(scene.id, take.id, { notes: e.target.value })}
                                    className="w-full text-xs text-gray-500 bg-transparent focus:outline-none"
                                    placeholder="Add notes..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Script */}
                      <div className="mt-2">
                        <textarea
                          value={scene.script}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            scenes: prev.scenes.map(s =>
                              s.id === scene.id ? { ...s, script: e.target.value } : s
                            )
                          }))}
                          placeholder="Add script..."
                          className="w-full text-sm bg-white/50 border border-gray-200 rounded p-2 focus:outline-none focus:border-amber-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComedySkits;
