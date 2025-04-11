import { FC, ReactNode } from 'react';
import FeatureHeader from './FeatureHeader';

interface BaseShortsPageProps {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
}

const BaseShortsPage: FC<BaseShortsPageProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FeatureHeader title={title} icon={icon} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature description */}
        <div className="mb-8">
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BaseShortsPage;
