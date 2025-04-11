import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

const features = [
  { path: 'mini-vlogs', name: 'Mini Vlogs', icon: '📹' },
  { path: 'challenges', name: 'Challenges', icon: '🏆' },
  { path: 'tutorials', name: 'Tutorials', icon: '📚' },
  { path: 'comedy-skits', name: 'Comedy Skits', icon: '🎭' },
  { path: 'pet-clips', name: 'Pet Clips', icon: '🐾' },
  { path: 'transformations', name: 'Transformations', icon: '✨' },
  { path: 'gaming', name: 'Gaming', icon: '🎮' },
  { path: 'reactions', name: 'Reactions', icon: '😮' },
  { path: 'music-dance', name: 'Music & Dance', icon: '🎵' },
  { path: 'educational', name: 'Educational', icon: '🎓' },
];

const ShortsNavbar: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <Link to="/shorts" className="block">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Shorts Creator
          </h2>
        </Link>
      </div>

      <div className="px-3 py-4">
        {features.map((feature) => {
          const isActive = currentPath === feature.path;
          return (
            <Link
              key={feature.path}
              to={`/shorts/${feature.path}`}
              className={`
                flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl">{feature.icon}</span>
              <span className="font-medium">{feature.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ShortsNavbar;
