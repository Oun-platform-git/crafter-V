import { FC } from 'react';

const Music: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Music & Dance Creator</h1>
          <p className="text-sm text-gray-500">Create music and dance content</p>
        </div>
      </header>
    </div>
  );
};

export default Music;
