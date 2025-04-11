import React from 'react';

export default function ToolsPanel({ onToolSelect }) {
  const tools = [
    { id: 'text', icon: 'T', label: 'Add Text' },
    { id: 'transition', icon: '🔄', label: 'Transitions' },
    { id: 'filter', icon: '🎨', label: 'Filters' },
    { id: 'audio', icon: '🎵', label: 'Audio' },
    { id: 'crop', icon: '⚄', label: 'Crop' },
    { id: 'speed', icon: '⚡', label: 'Speed' },
    { id: 'effects', icon: '✨', label: 'Effects' },
    { id: 'ai', icon: '🤖', label: 'AI Edit' },
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">{tool.icon}</span>
            <span className="text-sm">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Properties Panel */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              className="w-full"
              defaultValue="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Scale</label>
            <input
              type="range"
              min="50"
              max="150"
              className="w-full"
              defaultValue="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rotation</label>
            <input
              type="range"
              min="0"
              max="360"
              className="w-full"
              defaultValue="0"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full p-2 bg-gray-800 rounded hover:bg-gray-700 text-sm">
            Auto Enhance
          </button>
          <button className="w-full p-2 bg-gray-800 rounded hover:bg-gray-700 text-sm">
            Remove Background
          </button>
          <button className="w-full p-2 bg-gray-800 rounded hover:bg-gray-700 text-sm">
            Generate Captions
          </button>
        </div>
      </div>
    </div>
  );
}
