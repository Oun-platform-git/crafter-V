import React from 'react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    {
      category: 'Playback',
      items: [
        { keys: ['Space'], description: 'Play/Pause' },
        { keys: ['←', '→'], description: 'Seek backward/forward' },
        { keys: ['J', 'K', 'L'], description: 'Speed control (slower/pause/faster)' },
      ],
    },
    {
      category: 'Editing',
      items: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['Ctrl', 'X'], description: 'Split clip at playhead' },
        { keys: ['Delete'], description: 'Delete selected clip' },
        { keys: ['Ctrl', 'C'], description: 'Copy selected clip' },
        { keys: ['Ctrl', 'V'], description: 'Paste clip' },
      ],
    },
    {
      category: 'Tools',
      items: [
        { keys: ['T'], description: 'Text tool' },
        { keys: ['B'], description: 'Effects brush' },
        { keys: ['M'], description: 'Marker' },
        { keys: ['C'], description: 'Crop tool' },
      ],
    },
    {
      category: 'Timeline',
      items: [
        { keys: ['+', '-'], description: 'Zoom in/out' },
        { keys: ['[', ']'], description: 'Set in/out point' },
        { keys: ['Alt', 'Scroll'], description: 'Horizontal scroll' },
        { keys: ['Home', 'End'], description: 'Jump to start/end' },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-300">{item.description}</span>
                    <div className="flex items-center space-x-2">
                      {item.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 bg-gray-800 rounded text-sm font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-gray-900 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
