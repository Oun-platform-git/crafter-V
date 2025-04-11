import React from 'react';

export default function Settings() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* General Settings */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">General</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Video Quality</label>
            <select className="w-full px-4 py-2 bg-gray-800 rounded-lg">
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auto-Save Interval</label>
            <select className="w-full px-4 py-2 bg-gray-800 rounded-lg">
              <option value="30">Every 30 seconds</option>
              <option value="60">Every minute</option>
              <option value="300">Every 5 minutes</option>
            </select>
          </div>
        </div>
      </section>

      {/* AI Settings */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Voice</label>
            <select className="w-full px-4 py-2 bg-gray-800 rounded-lg">
              <option value="voice1">Male Voice 1</option>
              <option value="voice2">Female Voice 1</option>
              <option value="voice3">Male Voice 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Generation Style</label>
            <select className="w-full px-4 py-2 bg-gray-800 rounded-lg">
              <option value="creative">Creative</option>
              <option value="balanced">Balanced</option>
              <option value="precise">Precise</option>
            </select>
          </div>
        </div>
      </section>

      {/* Export Settings */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Export Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Format</label>
            <select className="w-full px-4 py-2 bg-gray-800 rounded-lg">
              <option value="mp4">MP4</option>
              <option value="mov">MOV</option>
              <option value="webm">WebM</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoUpload"
              className="mr-2"
            />
            <label htmlFor="autoUpload">Auto-upload to YouTube when export completes</label>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
        Save Settings
      </button>
    </div>
  );
}
