import { FC } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const features = [
  { path: 'mini-vlogs', name: 'Mini Vlogs', icon: '📹', color: 'from-pink-500 to-rose-500' },
  { path: 'challenges', name: 'Challenges', icon: '🏆', color: 'from-purple-500 to-indigo-500' },
  { path: 'tutorials', name: 'Tutorials', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  { path: 'comedy', name: 'Comedy Skits', icon: '🎭', color: 'from-yellow-500 to-orange-500' },
  { path: 'pet-clips', name: 'Pet Clips', icon: '🐾', color: 'from-emerald-500 to-teal-500' },
  { path: 'transformations', name: 'Transformations', icon: '✨', color: 'from-violet-500 to-purple-500' },
  { path: 'gaming', name: 'Gaming', icon: '🎮', color: 'from-red-500 to-orange-500' },
  { path: 'reactions', name: 'Reactions', icon: '😮', color: 'from-fuchsia-500 to-pink-500' },
  { path: 'music-dance', name: 'Music & Dance', icon: '🎵', color: 'from-blue-500 to-indigo-500' },
  { path: 'educational', name: 'Educational', icon: '🎓', color: 'from-green-500 to-emerald-500' },
];

const ShortsLayout: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  
  // If we're on a feature page, render that feature
  if (currentPath && currentPath !== 'shorts') {
    return <Outlet />;
  }

  // Otherwise, render the feature selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Shorts Creator
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Choose a format to create your next viral short
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={`/shorts/${feature.path}`}
              className={`
                group relative bg-white rounded-2xl shadow-sm overflow-hidden
                transform transition-all duration-200 hover:scale-105 hover:shadow-lg
              `}
            >
              {/* Background gradient */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                bg-gradient-to-r ${feature.color}
              `} />

              <div className="relative p-8">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl group-hover:scale-125 transition-transform">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white transition-colors">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-gray-500 group-hover:text-white/90 transition-colors">
                      Create engaging {feature.name.toLowerCase()} content
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortsLayout;
