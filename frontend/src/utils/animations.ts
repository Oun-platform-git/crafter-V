import { keyframes } from '@emotion/react';

export const animations = {
  // Shared Animations
  fadeIn: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  
  slideInLeft: keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `,

  bounce: keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  `,

  shake: keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  `,

  glowPulse: keyframes`
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  `,

  zoomIn: keyframes`
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  `,

  typewriter: keyframes`
    from { width: 0; }
    to { width: 100%; }
  `,
};

export const presets = {
  miniVlogs: {
    fonts: ['Inter', 'SF Pro Display'],
    animations: ['fadeIn', 'smoothZoom', 'textSync'],
    duration: '30-60s',
    music: 'Ambient/Lo-fi',
  },
  challenges: {
    fonts: ['Montserrat', 'Poppins'],
    animations: ['splitScreen', 'beatSync', 'countdownPulse'],
    duration: '15-30s',
    music: 'High Energy/EDM',
  },
  tutorials: {
    fonts: ['Source Sans Pro', 'Roboto'],
    animations: ['stepReveal', 'zoomFocus', 'pointCircle'],
    duration: '45-90s',
    music: 'Soft Background/None',
  },
  comedySkits: {
    fonts: ['Comic Pop', 'Bangers'],
    animations: ['quickZoom', 'textPunch', 'squashStretch'],
    duration: '20-40s',
    music: 'Comedic/SFX',
  },
  petClips: {
    fonts: ['Quicksand', 'Comic Sans MS'],
    animations: ['pawPrint', 'heartBurst', 'bubblePop'],
    duration: '15-30s',
    music: 'Cute/Playful',
  },
  transformations: {
    fonts: ['Playfair Display', 'DM Sans'],
    animations: ['glowUp', 'swipeSplit', 'timeWarp'],
    duration: '30-60s',
    music: 'Inspirational',
  },
  gaming: {
    fonts: ['Press Start 2P', 'Oxanium'],
    animations: ['criticalHit', 'xpGain', 'shockwave'],
    duration: '30-45s',
    music: 'Game Soundtrack/EDM',
  },
  reactions: {
    fonts: ['Nunito', 'DM Sans'],
    animations: ['freezeZoom', 'glitchEffect', 'textShake'],
    duration: '20-40s',
    music: 'None (Original Audio)',
  },
  educational: {
    fonts: ['Merriweather', 'Open Sans'],
    animations: ['typewriter', 'pointArrow', 'zoomDiagram'],
    duration: '60-120s',
    music: 'Soft Instrumental',
  },
} as const;

export type CategoryType = keyof typeof presets;

export const getSuggestions = (category: CategoryType) => {
  const preset = presets[category];
  return {
    font: preset.fonts[0],
    animationBundle: preset.animations,
    duration: preset.duration,
    music: preset.music,
  };
};
