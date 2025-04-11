import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface FeatureHeaderProps {
  title: string;
  icon: string;
}

const FeatureHeader: FC<FeatureHeaderProps> = ({ title, icon }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Back button and title */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/shorts')}
              className="mr-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{icon}</span>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>

          {/* Quick access to other features */}
          <div className="flex items-center space-x-4">
            <Link
              to="/shorts"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              All Features
            </Link>
            <button
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FeatureHeader;
