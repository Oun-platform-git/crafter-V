import { FC, useState } from 'react';
import { Link } from 'react-router-dom';

interface Step {
  id: string;
  title: string;
  duration: number;
  voiceOver: string;
  videoUrl: string | null;
}

interface TutorialsState {
  isRecording: boolean;
  currentStepIndex: number;
  steps: Step[];
  autoAdvance: boolean;
  showCaptions: boolean;
  voiceToText: boolean;
}

const Tutorials: FC = () => {
  const [state, setState] = useState<TutorialsState>({
    isRecording: false,
    currentStepIndex: 0,
    steps: [],
    autoAdvance: true,
    showCaptions: true,
    voiceToText: true,
  });

  const addNewStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: `Step ${state.steps.length + 1}`,
      duration: 10,
      voiceOver: '',
      videoUrl: null,
    };
    setState(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const deleteStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Tutorial Creator</h1>
                <p className="text-sm text-gray-500">Create step-by-step tutorials</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              disabled={state.steps.length === 0}
            >
              Export Tutorial
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
                {state.steps.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={addNewStep}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Add First Step</p>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Current Step Video */}
                    <video className="w-full h-full object-cover rounded-lg" />
                    
                    {/* Step Progress */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Step {state.currentStepIndex + 1} of {state.steps.length}
                          </span>
                          {state.showCaptions && (
                            <span className="text-sm">
                              {state.steps[state.currentStepIndex]?.voiceOver}
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-cyan-500 rounded-full transition-all"
                            style={{ width: `${((state.currentStepIndex + 1) / state.steps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recording Indicator */}
                    {state.isRecording && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 text-white px-4 py-2 rounded-full">
                        <span className="animate-pulse text-red-500">●</span>
                        <span>Recording</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Recording Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setState(prev => ({ ...prev, isRecording: !prev.isRecording }))}
                    className={`
                      px-6 py-3 rounded-lg font-medium flex items-center space-x-2
                      ${state.isRecording
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-cyan-500 text-white hover:bg-cyan-600'
                      }
                    `}
                  >
                    {state.isRecording ? (
                      <>
                        <span className="animate-pulse">●</span>
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <span>Record Step</span>
                    )}
                  </button>

                  {/* Step Navigation */}
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={state.currentStepIndex === 0}
                      onClick={() => setState(prev => ({
                        ...prev,
                        currentStepIndex: prev.currentStepIndex - 1
                      }))}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      disabled={state.currentStepIndex === state.steps.length - 1}
                      onClick={() => setState(prev => ({
                        ...prev,
                        currentStepIndex: prev.currentStepIndex + 1
                      }))}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setState(prev => ({ ...prev, autoAdvance: !prev.autoAdvance }))}
                    className={`
                      p-2 rounded-lg border-2
                      ${state.autoAdvance
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-cyan-200'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">Auto Advance</span>
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, showCaptions: !prev.showCaptions }))}
                    className={`
                      p-2 rounded-lg border-2
                      ${state.showCaptions
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-cyan-200'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">Show Captions</span>
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, voiceToText: !prev.voiceToText }))}
                    className={`
                      p-2 rounded-lg border-2
                      ${state.voiceToText
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-cyan-200'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">Voice to Text</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Steps */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Tutorial Steps</h2>
                <button
                  onClick={addNewStep}
                  className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              {state.steps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No steps added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add steps to create your tutorial</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${index === state.currentStepIndex
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                            className="w-full bg-transparent font-medium focus:outline-none"
                            placeholder="Step title..."
                          />
                          <input
                            type="text"
                            value={step.voiceOver}
                            onChange={(e) => updateStep(step.id, { voiceOver: e.target.value })}
                            className="w-full bg-transparent text-sm text-gray-500 mt-1 focus:outline-none"
                            placeholder="Voice over text..."
                          />
                        </div>
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Duration Control */}
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Duration</span>
                          <span>{step.duration}s</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          value={step.duration}
                          onChange={(e) => updateStep(step.id, { duration: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500"
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

export default Tutorials;
