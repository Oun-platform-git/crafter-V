import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import VideoRecorder from '../../../components/shared/VideoRecorder';
import VideoPreview from '../../../components/shared/VideoPreview';

interface PetProfile {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  color: string;
  traits: string[];
}

interface Clip {
  id: string;
  videoUrl: string | null;
  petId: string;
  effects: {
    focusTracking: boolean;
    slowMotion: boolean;
    zoomEffect: boolean;
    petSounds: boolean;
  };
  tags: string[];
}

interface PetClipsState {
  isRecording: boolean;
  pets: PetProfile[];
  clips: Clip[];
  selectedPetId: string | null;
  currentClipId: string | null;
  autoFocus: boolean;
  effectPresets: boolean;
}

const PetClips: FC = () => {
  const [state, setState] = useState<PetClipsState>({
    isRecording: false,
    pets: [],
    clips: [],
    selectedPetId: null,
    currentClipId: null,
    autoFocus: true,
    effectPresets: true,
  });

  const addNewPet = () => {
    const newPet: PetProfile = {
      id: Date.now().toString(),
      name: '',
      type: 'dog',
      color: '',
      traits: [],
    };
    setState(prev => ({
      ...prev,
      pets: [...prev.pets, newPet],
      selectedPetId: newPet.id,
    }));
  };

  const addNewClip = () => {
    if (!state.selectedPetId) return;
    
    const newClip: Clip = {
      id: Date.now().toString(),
      videoUrl: null,
      petId: state.selectedPetId,
      effects: {
        focusTracking: true,
        slowMotion: false,
        zoomEffect: false,
        petSounds: true,
      },
      tags: [],
    };
    setState(prev => ({
      ...prev,
      clips: [...prev.clips, newClip],
      currentClipId: newClip.id,
    }));
  };

  const updatePet = (petId: string, updates: Partial<PetProfile>) => {
    setState(prev => ({
      ...prev,
      pets: prev.pets.map(pet =>
        pet.id === petId ? { ...pet, ...updates } : pet
      ),
    }));
  };

  const updateClip = (clipId: string, updates: Partial<Clip>) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(clip =>
        clip.id === clipId ? { ...clip, ...updates } : clip
      ),
    }));
  };

  const currentClip = state.clips.find(clip => clip.id === state.currentClipId);
  const selectedPet = state.pets.find(pet => pet.id === state.selectedPetId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Pet Clip Creator</h1>
                <p className="text-sm text-gray-500">Create adorable pet videos</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              disabled={!currentClip}
            >
              Export Clip
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
                videoUrl={currentClip?.videoUrl}
                overlay={
                  state.autoFocus && selectedPet && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="border-4 border-purple-500/50 rounded-full w-32 h-32 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                  )
                }
                emptyState={
                  <div className="absolute inset-0 flex items-center justify-center">
                    {state.pets.length === 0 ? (
                      <button
                        onClick={addNewPet}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-gray-500">Add Your First Pet</p>
                      </button>
                    ) : (
                      <button
                        onClick={addNewClip}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500">Record New Clip</p>
                      </button>
                    )}
                  </div>
                }
              />

              {/* Recording Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <VideoRecorder
                    isRecording={state.isRecording}
                    onToggleRecording={() => setState(prev => ({ ...prev, isRecording: !prev.isRecording }))}
                    buttonColor="purple"
                    buttonText="Record Clip"
                  />

                  {/* Feature Toggles */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setState(prev => ({ ...prev, autoFocus: !prev.autoFocus }))}
                      className={`
                        p-2 rounded-lg border-2
                        ${state.autoFocus
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                        }
                      `}
                    >
                      <span className="text-sm font-medium">Auto Focus</span>
                    </button>
                    <button
                      onClick={() => setState(prev => ({ ...prev, effectPresets: !prev.effectPresets }))}
                      className={`
                        p-2 rounded-lg border-2
                        ${state.effectPresets
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                        }
                      `}
                    >
                      <span className="text-sm font-medium">Effect Presets</span>
                    </button>
                  </div>
                </div>

                {/* Effect Controls */}
                {currentClip && (
                  <div className="flex items-center space-x-2">
                    {Object.entries(currentClip.effects).map(([effect, enabled]) => (
                      <button
                        key={effect}
                        onClick={() => updateClip(currentClip.id, {
                          effects: { ...currentClip.effects, [effect]: !enabled }
                        })}
                        className={`
                          p-2 rounded-lg border-2
                          ${enabled
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">
                          {effect.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Pets & Clips */}
          <div className="lg:col-span-4 space-y-6">
            {/* Pets */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Your Pets</h2>
                <button
                  onClick={addNewPet}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {state.pets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No pets added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your pets to start recording</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.pets.map(pet => (
                    <div
                      key={pet.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${pet.id === state.selectedPetId
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={pet.name}
                            onChange={(e) => updatePet(pet.id, { name: e.target.value })}
                            className="w-full bg-transparent font-medium focus:outline-none"
                            placeholder="Pet name..."
                          />
                          <div className="flex items-center space-x-2 mt-2">
                            <select
                              value={pet.type}
                              onChange={(e) => updatePet(pet.id, { type: e.target.value as PetProfile['type'] })}
                              className="text-sm bg-transparent border-gray-200 rounded focus:border-purple-500 focus:ring-purple-500"
                            >
                              <option value="dog">Dog</option>
                              <option value="cat">Cat</option>
                              <option value="bird">Bird</option>
                              <option value="other">Other</option>
                            </select>
                            <input
                              type="text"
                              value={pet.color}
                              onChange={(e) => updatePet(pet.id, { color: e.target.value })}
                              className="text-sm bg-transparent border-gray-200 rounded focus:border-purple-500 focus:ring-purple-500"
                              placeholder="Color..."
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setState(prev => ({
                            ...prev,
                            selectedPetId: pet.id
                          }))}
                          className={`
                            p-2 rounded-lg
                            ${pet.id === state.selectedPetId
                              ? 'text-purple-600'
                              : 'text-gray-400 hover:text-gray-600'
                            }
                          `}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clips */}
            {selectedPet && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">{selectedPet.name}'s Clips</h2>
                  <button
                    onClick={addNewClip}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {state.clips
                    .filter(clip => clip.petId === selectedPet.id)
                    .map(clip => (
                      <div
                        key={clip.id}
                        className={`
                          p-4 rounded-lg border-2 transition-all cursor-pointer
                          ${clip.id === state.currentClipId
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200'
                          }
                        `}
                        onClick={() => setState(prev => ({ ...prev, currentClipId: clip.id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-gray-100 rounded" />
                            <div>
                              <p className="font-medium">Clip {state.clips.indexOf(clip) + 1}</p>
                              <div className="flex items-center space-x-1">
                                {Object.entries(clip.effects)
                                  .filter(([, enabled]) => enabled)
                                  .map(([effect]) => (
                                    <span
                                      key={effect}
                                      className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded"
                                    >
                                      {effect.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetClips;
