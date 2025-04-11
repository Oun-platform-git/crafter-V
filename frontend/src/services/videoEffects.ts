import { API_CONFIG } from '../config/api';

export interface VideoEffect {
  id: string;
  name: string;
  icon: string;
  description: string;
  intensity?: number;
  params?: Record<string, any>;
}

export const PRESET_EFFECTS: VideoEffect[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '🔍',
    description: 'Smooth zoom in/out effect',
    params: {
      direction: 'in', // or 'out'
      speed: 1.5
    }
  },
  {
    id: 'blur',
    name: 'Blur Background',
    icon: '🌫️',
    description: 'Blur background while keeping subject in focus',
    intensity: 0.5
  },
  {
    id: 'flash',
    name: 'Flash Transition',
    icon: '⚡',
    description: 'Quick flash transition effect',
    params: {
      duration: 0.3,
      color: '#ffffff'
    }
  },
  {
    id: 'shake',
    name: 'Camera Shake',
    icon: '📳',
    description: 'Add dynamic camera shake',
    intensity: 0.3
  },
  {
    id: 'glitch',
    name: 'Glitch Effect',
    icon: '👾',
    description: 'Digital glitch and distortion',
    params: {
      intensity: 0.5,
      frequency: 0.3,
      colorShift: true
    }
  },
  {
    id: 'timelapse',
    name: 'Time Lapse',
    icon: '⏱️',
    description: 'Speed up footage with smooth frame blending',
    params: {
      speed: 8,
      frameBlending: true
    }
  },
  {
    id: 'mirror',
    name: 'Mirror Effect',
    icon: '🪞',
    description: 'Create mirror reflection effect',
    params: {
      direction: 'horizontal', // or 'vertical'
      offset: 0.5
    }
  },
  {
    id: 'duotone',
    name: 'Duotone',
    icon: '🎨',
    description: 'Two-color gradient effect',
    params: {
      color1: '#ff3366',
      color2: '#33ccff',
      blend: 0.7
    }
  },
  {
    id: 'pixelate',
    name: 'Pixelate',
    icon: '🎮',
    description: 'Add retro pixelation effect',
    params: {
      size: 16,
      smoothing: false
    }
  },
  {
    id: 'vhs',
    name: 'VHS Style',
    icon: '📼',
    description: 'Vintage VHS tape effect',
    params: {
      tracking: 0.5,
      noise: 0.3,
      colorShift: true
    }
  }
];

export const MOOD_EFFECTS: Record<string, VideoEffect> = {
  happy: {
    id: 'happy',
    name: 'Happy Vibes',
    icon: '😊',
    description: 'Bright and warm color grading',
    params: {
      saturation: 1.2,
      brightness: 1.1,
      contrast: 1.1,
      temperature: 5000
    }
  },
  excited: {
    id: 'excited',
    name: 'High Energy',
    icon: '🎉',
    description: 'Vibrant colors with dynamic transitions',
    params: {
      saturation: 1.3,
      contrast: 1.2,
      vibrance: 1.2
    }
  },
  chill: {
    id: 'chill',
    name: 'Chill Mode',
    icon: '😎',
    description: 'Soft, cool-toned color grading',
    params: {
      saturation: 0.9,
      contrast: 0.95,
      temperature: 4500
    }
  },
  serious: {
    id: 'serious',
    name: 'Professional Look',
    icon: '🤔',
    description: 'Clean, neutral color grading',
    params: {
      saturation: 0.95,
      contrast: 1.05,
      sharpness: 1.1
    }
  },
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic Look',
    icon: '🎬',
    description: 'Professional film-like grading',
    params: {
      contrast: 1.2,
      saturation: 0.9,
      highlights: -0.2,
      shadows: 0.1,
      grain: 0.1
    }
  },
  retro: {
    id: 'retro',
    name: 'Retro Vibes',
    icon: '🕰️',
    description: 'Vintage film look',
    params: {
      saturation: 0.8,
      contrast: 1.1,
      grain: 0.2,
      vignette: 0.3,
      temperature: 5500
    }
  },
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    icon: '🌃',
    description: 'Vibrant neon color grading',
    params: {
      saturation: 1.4,
      contrast: 1.3,
      highlights: 0.3,
      shadows: -0.4,
      neonGlow: 0.5
    }
  }
};

class VideoEffectsService {
  async applyEffect(videoId: string, effectId: string, params?: Record<string, any>): Promise<string> {
    const response = await fetch(`${API_CONFIG.API_URL}${API_CONFIG.endpoints.video.effects.apply(videoId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        effectId,
        params: params || (PRESET_EFFECTS.find(e => e.id === effectId)?.params || {})
      })
    });

    if (!response.ok) {
      throw new Error('Failed to apply effect');
    }

    const data = await response.json();
    return data.processedVideoUrl;
  }

  async applyTransition(videoId: string, transitionId: string, duration: number): Promise<string> {
    const response = await fetch(`${API_CONFIG.API_URL}${API_CONFIG.endpoints.video.effects.apply(videoId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'transition',
        transitionId,
        duration,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply transition');
    }

    const data = await response.json();
    return data.processedVideoUrl;
  }

  async applyMoodEffect(videoId: string, mood: string): Promise<string> {
    const moodEffect = MOOD_EFFECTS[mood];
    if (!moodEffect) {
      throw new Error(`Invalid mood: ${mood}`);
    }

    return this.applyEffect(videoId, moodEffect.id, moodEffect.params);
  }

  async chainEffects(videoId: string, effects: string[]): Promise<string> {
    const response = await fetch(`${API_CONFIG.API_URL}${API_CONFIG.endpoints.video.effects.apply(videoId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        effects: effects.map(effectId => ({
          id: effectId,
          params: PRESET_EFFECTS.find(e => e.id === effectId)?.params || {}
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Failed to apply effects chain');
    }

    const data = await response.json();
    return data.processedVideoUrl;
  }

  async applyAIEnhancement(videoId: string, type: string): Promise<string> {
    const response = await fetch(`${API_CONFIG.API_URL}${API_CONFIG.endpoints.video.effects.aiEnhance(videoId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        params: {
          model: 'latest'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to apply AI enhancement');
    }

    const data = await response.json();
    return data.processedVideoUrl;
  }

  async generateTransition(sourceVideoId: string, targetVideoId: string, type: string): Promise<string> {
    const response = await fetch(`${API_CONFIG.API_URL}${API_CONFIG.endpoints.video.effects.generateTransition}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceVideoId,
        targetVideoId,
        type,
        params: {
          duration: 1.0,
          smoothing: true
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate transition');
    }

    const data = await response.json();
    return data.transitionUrl;
  }

  async applyBackgroundRemoval(videoId: string, params?: Record<string, any>): Promise<string> {
    const response = await fetch(`${API_CONFIG.API_URL}${API_CONFIG.endpoints.video.effects.removeBackground(videoId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: {
          mode: 'precise',
          featherEdges: true,
          ...params
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to remove background');
    }

    const data = await response.json();
    return data.processedVideoUrl;
  }

  getEffectById(effectId: string): VideoEffect | undefined {
    return PRESET_EFFECTS.find(effect => effect.id === effectId);
  }

  getMoodEffect(mood: string): VideoEffect | undefined {
    return MOOD_EFFECTS[mood];
  }
}

export const videoEffectsService = new VideoEffectsService();
