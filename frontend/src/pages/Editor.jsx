import React, { useState } from "react";
import Preview from "../components/editor/Preview";
import Timeline from "../components/editor/Timeline";
import ToolsPanel from "../components/editor/ToolsPanel";
import EffectsPanel from "../components/editor/EffectsPanel";
import FileUpload from "../components/common/FileUpload";
import KeyboardShortcutsModal from "../components/editor/KeyboardShortcutsModal";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

export default function Editor() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [rightPanel, setRightPanel] = useState('tools'); // 'tools' or 'effects'
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Mock data - will be replaced with real data
  const mockTracks = [
    {
      id: 1,
      type: "video",
      clips: [
        { id: 1, name: "Main Video", start: 0, end: 30 },
      ],
    },
    {
      id: 2,
      type: "audio",
      clips: [
        { id: 2, name: "Background Music", start: 0, end: 20 },
      ],
    },
    {
      id: 3,
      type: "text",
      clips: [
        { id: 3, name: "Title", start: 2, end: 8 },
      ],
    },
  ];

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
  };

  const handleFileUpload = (file) => {
    setVideoFile(file);
    // TODO: Process the uploaded video
  };

  const handleApplyEffect = (effectId, value) => {
    // TODO: Apply effect to video
    console.log('Applying effect:', effectId, value);
  };

  const handleApplyTransition = (transitionId) => {
    // TODO: Apply transition
    console.log('Applying transition:', transitionId);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, lastAction]);
    // TODO: Implement undo logic
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextAction = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, nextAction]);
    // TODO: Implement redo logic
  };

  const handleSplitClip = () => {
    // TODO: Split clip at current time
    console.log('Splitting clip at:', currentTime);
  };

  const handleDeleteSelected = () => {
    // TODO: Delete selected clip
    console.log('Deleting selected clip');
  };

  const handleCopySelected = () => {
    // TODO: Copy selected clip
    console.log('Copying selected clip');
  };

  const handlePaste = () => {
    // TODO: Paste clip
    console.log('Pasting clip');
  };

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    // Playback controls
    { key: ' ', action: () => setIsPlaying(!isPlaying) },
    { key: 'ArrowLeft', action: () => setCurrentTime(Math.max(0, currentTime - 1)) },
    { key: 'ArrowRight', action: () => setCurrentTime(currentTime + 1) },
    { key: 'j', action: () => setCurrentTime(Math.max(0, currentTime - 5)) },
    { key: 'l', action: () => setCurrentTime(currentTime + 5) },
    { key: 'k', action: () => setIsPlaying(false) },

    // Editing shortcuts
    { key: 'z', ctrlKey: true, action: handleUndo },
    { key: 'z', ctrlKey: true, shiftKey: true, action: handleRedo },
    { key: 'x', ctrlKey: true, action: handleSplitClip },
    { key: 'Delete', action: handleDeleteSelected },
    { key: 'c', ctrlKey: true, action: handleCopySelected },
    { key: 'v', ctrlKey: true, action: handlePaste },

    // Tool shortcuts
    { key: 't', action: () => setSelectedTool('text') },
    { key: 'b', action: () => setSelectedTool('effects') },
    { key: 'm', action: () => setSelectedTool('marker') },
    { key: 'c', action: () => setSelectedTool('crop') },

    // Panel shortcuts
    { key: 'e', ctrlKey: true, action: () => setRightPanel('effects') },
    { key: 't', ctrlKey: true, action: () => setRightPanel('tools') },

    // Help
    { key: '?', shiftKey: true, action: () => setShowKeyboardShortcuts(true) },
  ]);

  return (
    <div className="h-full flex flex-col">
      {!videoFile ? (
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <FileUpload onUpload={handleFileUpload} />
          </div>
        </div>
      ) : (
        <>
          {/* Main Editor Layout */}
          <div className="flex-1 grid grid-cols-[1fr,300px] gap-4 p-4">
            {/* Left Side - Preview and Timeline */}
            <div className="space-y-4">
              {/* Preview Window */}
              <Preview
                videoUrl={URL.createObjectURL(videoFile)}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Timeline */}
              <Timeline
                tracks={mockTracks}
                currentTime={currentTime}
                duration={30}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>

            {/* Right Side Panel */}
            <div className="space-y-4">
              {/* Panel Toggle */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setRightPanel('tools')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    rightPanel === 'tools'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Tools
                </button>
                <button
                  onClick={() => setRightPanel('effects')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    rightPanel === 'effects'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Effects
                </button>
              </div>

              {/* Panel Content */}
              {rightPanel === 'tools' ? (
                <ToolsPanel onToolSelect={handleToolSelect} />
              ) : (
                <EffectsPanel
                  onApplyEffect={handleApplyEffect}
                  onApplyTransition={handleApplyTransition}
                />
              )}

              {/* Keyboard Shortcuts Help */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="w-full mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <span>⌨️</span>
                <span>Keyboard Shortcuts</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar - Quick Access */}
          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUndo}
                  className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>↩️</span>
                  <span>Undo</span>
                </button>
                <button
                  onClick={handleRedo}
                  className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>↪️</span>
                  <span>Redo</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 flex items-center space-x-2">
                  <span>💾</span>
                  <span>Save Draft</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center space-x-2">
                  <span>📤</span>
                  <span>Export Video</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
}
