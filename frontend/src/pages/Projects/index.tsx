import { FC } from 'react';

const Projects: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="mt-2 text-gray-600">Manage your video projects</p>
        </header>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Project Card */}
          <button className="group relative h-48 bg-white rounded-xl shadow-sm overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">Create New Project</p>
                <p className="mt-1 text-xs text-gray-500">Start from scratch or use a template</p>
              </div>
            </div>
          </button>

          {/* Recent Projects */}
          {[
            { 
              id: 1, 
              title: 'Morning Routine', 
              type: 'Mini Vlog',
              date: '2 days ago',
              thumbnail: null,
              progress: 75
            },
            { 
              id: 2, 
              title: 'Product Review', 
              type: 'Tutorial',
              date: '1 week ago',
              thumbnail: null,
              progress: 100
            },
            { 
              id: 3, 
              title: 'Dance Challenge', 
              type: 'Challenge',
              date: 'Just now',
              thumbnail: null,
              progress: 30
            }
          ].map(project => (
            <div 
              key={project.id}
              className="group relative h-48 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail or Placeholder */}
              <div className="absolute inset-0 bg-gray-100 group-hover:opacity-90 transition-opacity">
                {project.thumbnail ? (
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="absolute inset-x-0 bottom-0 bg-white/90 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{project.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">{project.date}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-right">{project.progress}% complete</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
