import React, { useState } from 'react';
import FileUpload from '../components/common/FileUpload';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // TODO: Implement video generation
    setGenerating(false);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    // TODO: Process the uploaded file
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Video</h1>
      
      {/* Content Creation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* AI Generation */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            AI Video Generation
          </h2>
          <textarea
            className="w-full h-32 bg-gray-800 text-white rounded-lg p-4 mb-4 resize-none"
            placeholder="Describe your video idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold ${
              generating
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Video'}
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📤</span>
            Upload Video
          </h2>
          <FileUpload onUpload={handleFileUpload} />
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Product Showcase', icon: '🛍️' },
            { name: 'Tutorial Video', icon: '📚' },
            { name: 'Social Media Story', icon: '📱' },
            { name: 'Promotional Ad', icon: '🎯' },
            { name: 'Educational Content', icon: '🎓' },
            { name: 'Entertainment Clip', icon: '🎭' },
          ].map((template) => (
            <button
              key={template.name}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
              onClick={() => setPrompt(`Create a ${template.name.toLowerCase()}...`)}
            >
              <span className="text-2xl mb-2 block">{template.icon}</span>
              <span className="font-medium">{template.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      {uploadedFile && (
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Upload</h2>
          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🎥</span>
              <div>
                <div className="font-medium">{uploadedFile.name}</div>
                <div className="text-sm text-gray-400">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => {/* TODO: Open in editor */}}
            >
              Edit Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
