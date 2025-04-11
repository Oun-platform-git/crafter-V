import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Tabs({
  tabs,
  defaultTab,
  variant = 'default',
  fullWidth = false,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const { isDark } = useTheme();

  const variants = {
    default: {
      container: `border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`,
      tab: (isActive) => `
        px-4
        py-2
        -mb-px
        ${isActive ? 'border-b-2' : ''}
        ${isDark
          ? `${isActive ? 'border-blue-500 text-blue-500' : 'text-gray-400 hover:text-gray-300'}`
          : `${isActive ? 'border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-700'}`
        }
      `,
    },
    pills: {
      container: 'space-x-2',
      tab: (isActive) => `
        px-4
        py-2
        rounded-full
        ${isDark
          ? `${
              isActive
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`
          : `${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
            }`
        }
      `,
    },
    boxed: {
      container: `border ${isDark ? 'border-gray-800' : 'border-gray-200'} rounded-lg p-1`,
      tab: (isActive) => `
        px-4
        py-2
        rounded-md
        ${isDark
          ? `${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`
          : `${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-700'
            }`
        }
      `,
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className={`${className}`}>
      <div
        className={`
          flex
          ${fullWidth ? 'w-full' : ''}
          ${currentVariant.container}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              tab.onClick?.();
            }}
            disabled={tab.disabled}
            className={`
              ${fullWidth ? 'flex-1' : ''}
              transition-all
              duration-200
              font-medium
              text-sm
              focus:outline-none
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${currentVariant.tab(activeTab === tab.id)}
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`
                    px-2
                    py-0.5
                    text-xs
                    rounded-full
                    ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
                    ${isDark ? 'text-gray-300' : 'text-gray-700'}
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
