import React, { useState } from 'react';
import { templates } from '../data/templates';

const DEFAULT_THUMBNAILS = {
  'social-story': 'https://placehold.co/1080x1920/2563eb/ffffff?text=Social+Story',
  'product-promo': 'https://placehold.co/1920x1080/2563eb/ffffff?text=Product+Promo',
  'youtube-intro': 'https://placehold.co/1920x1080/2563eb/ffffff?text=YouTube+Intro',
  'corporate-presentation': 'https://placehold.co/1920x1080/2563eb/ffffff?text=Corporate',
  'travel-vlog': 'https://placehold.co/1920x1080/2563eb/ffffff?text=Travel+Vlog',
  'podcast-visualizer': 'https://placehold.co/1920x1080/2563eb/ffffff?text=Podcast',
  'gaming-stream': 'https://placehold.co/1920x1080/2563eb/ffffff?text=Gaming',
  'fashion-lookbook': 'https://placehold.co/1080x1350/2563eb/ffffff?text=Fashion'
};

export default function Templates({ onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="p-6">
      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
            onClick={() => onSelect(template)}
          >
            {/* Template Preview */}
            <div className="aspect-video relative bg-gray-900">
              <img
                src={DEFAULT_THUMBNAILS[template.id] || 'https://placehold.co/1920x1080/2563eb/ffffff?text=Template'}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/1920x1080/2563eb/ffffff?text=Template';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  Use Template
                </button>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                <span className="text-xs text-gray-400">{template.aspectRatio}</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{template.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{template.duration}s</span>
                <span>•</span>
                <span>{template.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
