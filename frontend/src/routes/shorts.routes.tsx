import { RouteObject } from 'react-router-dom';
import ShortsLayout from '../components/shorts-crafter/ShortsLayout';
import MiniVlogsPage from '../pages/shorts/mini-vlogs/MiniVlogsPage';
import ChallengesPage from '../pages/shorts/challenges/ChallengesPage';
import TutorialsPage from '../pages/shorts/tutorials/TutorialsPage';

// Placeholder component for features not yet implemented
const PlaceholderPage = () => (
  <div className="p-8">Feature coming soon...</div>
);

export const shortsRoutes: RouteObject = {
  path: 'shorts',
  element: <ShortsLayout />,
  children: [
    {
      path: 'mini-vlogs',
      element: <MiniVlogsPage />,
    },
    {
      path: 'challenges',
      element: <ChallengesPage />,
    },
    {
      path: 'tutorials',
      element: <TutorialsPage />,
    },
    {
      path: 'comedy',
      element: <PlaceholderPage />,
    },
    {
      path: 'pet-clips',
      element: <PlaceholderPage />,
    },
    {
      path: 'transformations',
      element: <PlaceholderPage />,
    },
    {
      path: 'gaming',
      element: <PlaceholderPage />,
    },
    {
      path: 'reactions',
      element: <PlaceholderPage />,
    },
    {
      path: 'music-dance',
      element: <PlaceholderPage />,
    },
    {
      path: 'educational',
      element: <PlaceholderPage />,
    },
    {
      path: '',
      element: <MiniVlogsPage />,
    },
  ],
};
