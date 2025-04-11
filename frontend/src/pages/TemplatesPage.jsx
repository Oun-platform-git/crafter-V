import React from 'react';
import { useNavigate } from 'react-router-dom';
import Templates from '../components/Templates';

export default function TemplatesPage() {
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    // Here you would typically create a new project with the selected template
    // For now, we'll just navigate to the editor
    navigate(`/editor/new?template=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Video Templates</h1>
          <p className="mt-2 text-gray-400">
            Choose from our collection of professional templates to get started quickly
          </p>
        </div>
        
        <Templates onSelect={handleTemplateSelect} />
      </div>
    </div>
  );
}
