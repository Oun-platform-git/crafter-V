import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  VideoCameraIcon,
  FilmIcon,
  FolderIcon,
  Cog6ToothIcon,
  Square3Stack3DIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  AcademicCapIcon,
  FaceSmileIcon,
  HeartIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  SignalIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import Logo from './Logo';

export default function Sidebar() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    shorts: true,
    streaming: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const mainLinks = [
    { name: 'Dashboard', to: '/', icon: HomeIcon },
    { name: 'Editor', to: '/editor', icon: VideoCameraIcon },
    { name: 'Templates', to: '/templates', icon: Square3Stack3DIcon },
    { name: 'Projects', to: '/projects', icon: FolderIcon },
    { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
  ];

  const shortsLinks = [
    { name: 'Mini Vlogs', to: '/ShortsCreator/MiniVlogs', icon: VideoCameraIcon },
    { name: 'Challenges', to: '/ShortsCreator/Challenges', icon: TrophyIcon },
    { name: 'Tutorials', to: '/ShortsCreator/Tutorials', icon: AcademicCapIcon },
    { name: 'Comedy Skits', to: '/ShortsCreator/ComedySkits', icon: FaceSmileIcon },
    { name: 'Pet Clips', to: '/ShortsCreator/PetClips', icon: HeartIcon },
    { name: 'Transformations', to: '/ShortsCreator/Transformations', icon: SparklesIcon },
    { name: 'Gaming', to: '/ShortsCreator/Gaming', icon: PuzzlePieceIcon },
    { name: 'Reactions', to: '/ShortsCreator/Reactions', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Music & Dance', to: '/ShortsCreator/Music', icon: MusicalNoteIcon },
    { name: 'Educational', to: '/ShortsCreator/Educational', icon: AcademicCapIcon },
  ];

  const streamingLinks = [
    { name: 'Live Dashboard', to: '/live', icon: SignalIcon },
    { name: 'Stream Analytics', to: '/live/analytics', icon: UserGroupIcon },
  ];

  const renderLinks = (links) => (
    <ul className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        return (
          <li key={link.name}>
            <Link
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderSection = (title, links, section) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
      >
        <span>{title}</span>
        {expandedSections[section] ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="mt-1">{renderLinks(links)}</div>
      )}
    </div>
  );

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-8 px-4 py-2">
          <Logo size="default" />
        </div>
        <nav className="space-y-6">
          {renderSection('Main Menu', mainLinks, 'main')}
          {renderSection('Shorts Creator', shortsLinks, 'shorts')}
          {renderSection('Live Streaming', streamingLinks, 'streaming')}
        </nav>
      </div>
    </aside>
  );
}
