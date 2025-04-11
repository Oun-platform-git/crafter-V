import React from 'react';

export default function Projects() {
  // Mock projects data - will be replaced with real data later
  const projects = [
    {
      id: 1,
      title: 'Project 1',
      thumbnail: '/placeholder.jpg',
      lastModified: '2024-04-05',
      duration: '2:30',
    },
    // Add more mock projects as needed
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            className="px-4 py-2 bg-gray-800 rounded-lg"
          />
          <select className="px-4 py-2 bg-gray-800 rounded-lg">
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
          >
            <div className="aspect-video bg-gray-800">
              {/* Thumbnail placeholder */}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{project.title}</h3>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Modified {project.lastModified}</span>
                <span>{project.duration}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Project Card */}
        <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-700 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center aspect-[4/3]">
          <div className="text-center">
            <div className="text-4xl mb-2">+</div>
            <div className="text-gray-400">Create New Project</div>
          </div>
        </div>
      </div>
    </div>
  );
}
