const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';

export const API_CONFIG = {
  API_URL,
  WEBSOCKET_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      profile: '/auth/profile'
    },
    video: {
      upload: '/video/upload',
      process: '/video/process',
      effects: {
        base: '/video/effects',
        apply: (videoId: string) => `/video/effects/${videoId}/apply`,
        aiEnhance: (videoId: string) => `/video/effects/${videoId}/ai-enhance`,
        generateTransition: '/video/effects/generate-transition',
        removeBackground: (videoId: string) => `/video/effects/${videoId}/remove-background`
      },
      transitions: '/video/transitions',
      combine: '/video/combine-segments'
    },
    projects: {
      list: '/projects',
      create: '/projects',
      update: '/projects/:id',
      delete: '/projects/:id',
      render: '/projects/:id/render'
    }
  }
};
